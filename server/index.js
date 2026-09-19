import http from 'node:http';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.env.PORT || 8787);
const db = new DatabaseSync(process.env.REJASA_DB || './server/rejasa.sqlite');
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN','LABORAN','GURU')),
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS labs (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    lab_id TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    class_name TEXT NOT NULL,
    activity TEXT NOT NULL,
    FOREIGN KEY(lab_id) REFERENCES labs(id)
  );
  CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    lab_id TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY(lab_id) REFERENCES labs(id)
  );
  CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    lab_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    schedule_id TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    activity TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    students_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('DRAFT','SUBMITTED','REVIEWED','NEEDS_CORRECTION')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(lab_id) REFERENCES labs(id),
    FOREIGN KEY(teacher_id) REFERENCES users(id),
    FOREIGN KEY(schedule_id) REFERENCES schedules(id)
  );
  CREATE TABLE IF NOT EXISTS journal_reviews (
    id TEXT PRIMARY KEY,
    journal_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY(journal_id) REFERENCES journals(id),
    FOREIGN KEY(reviewer_id) REFERENCES users(id)
  );
`);

const seed = db.prepare('INSERT OR IGNORE INTO users (id, code, name, role) VALUES (?, ?, ?, ?)');
seed.run('usr-admin', 'ADMIN', 'Administrator REJASA', 'ADMIN');
seed.run('usr-laboran', 'LAB', 'Laboran REJASA', 'LABORAN');
seed.run('usr-guru-ml', 'ML', 'Guru ML', 'GURU');
seed.run('usr-guru-kp1', 'KP1', 'Guru KP1', 'GURU');
seed.run('usr-guru-sk', 'SK', 'Guru SK', 'GURU');

const labSeed = db.prepare('INSERT OR IGNORE INTO labs (id, code, name) VALUES (?, ?, ?)');
[
  ['lab-bio','BIO','Lab Biologi Terpadu'],
  ['lab-fis','FIS','Lab Fisika Modern'],
  ['lab-kim','KIM','Lab Kimia Anorganik'],
  ['lab-com','COM','Lab Komputer Sains'],
  ['lab-bsm','BSM','Smartclass & Bahasa'],
].forEach(row => labSeed.run(...row));

const scheduleSeed = db.prepare('INSERT OR IGNORE INTO schedules (id, lab_id, date, start_time, end_time, class_name, activity) VALUES (?, ?, ?, ?, ?, ?, ?)');
scheduleSeed.run('sch-bio-20260918-01','lab-bio','2026-09-18','08:00','10:00','XI IPA 1','Pengamatan jaringan tumbuhan');
scheduleSeed.run('sch-bio-20260919-01','lab-bio','2026-09-19','08:00','10:00','XI IPA 1','Praktikum biologi');
scheduleSeed.run('sch-kim-20260919-01','lab-kim','2026-09-19','10:00','12:00','XII IPA 3','Titrasi asam basa');
scheduleSeed.run('sch-fis-20260919-01','lab-fis','2026-09-19','07:30','09:30','X-2','Karakteristik V-I');

const sessions = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(v => {
    const i=v.indexOf('=');
    return [v.slice(0,i).trim(), decodeURIComponent(v.slice(i+1))];
  }));
}
function userFromRequest(req) {
  const token = parseCookies(req).rejasa_session;
  return token ? sessions.get(token) || null : null;
}
function requireAuth(req,res,roles=[]) {
  const user = userFromRequest(req);
  if (!user) { json(res,401,{error:'UNAUTHORIZED'}); return null; }
  if (roles.length && !roles.includes(user.role)) { json(res,403,{error:'FORBIDDEN'}); return null; }
  return user;
}
async function body(req) {
  let raw='';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
function now() { return new Date().toISOString(); }
function journalCode() {
  const d=new Date().toISOString().slice(0,10).replace(/-/g,'');
  const row=db.prepare("SELECT COUNT(*) AS n FROM journals WHERE code LIKE ?").get(`JR-${d}-%`);
  return `JR-${d}-${String(Number(row.n)+1).padStart(4,'0')}`;
}
function publicLab(row) { return {id:row.id,code:row.code,name:row.name}; }
function publicJournal(row) {
  return {
    id:row.id, code:row.code, labId:row.lab_id, labCode:row.lab_code, labName:row.lab_name,
    teacherId:row.teacher_id, teacherName:row.teacher_name, teacherInitials:(row.teacher_name||'').split(/\\s+/).slice(0,2).map(v=>v[0]).join(''),
    teacherAvatarColor:'bg-[#00685f]', className:row.class_name, session:row.date,
    date:row.date, time:row.time, subject:row.subject, activity:row.activity,
    topic:row.activity || row.subject, notes:row.notes, studentsCount:row.students_count,
    sopComplied:true, status:row.status,
    createdAt:row.created_at, updatedAt:row.updated_at
  };
}
function journalById(id) {
  return db.prepare(`
    SELECT j.*, l.code lab_code, l.name lab_name, u.name teacher_name
    FROM journals j JOIN labs l ON l.id=j.lab_id JOIN users u ON u.id=j.teacher_id
    WHERE j.id=?
  `).get(id);
}
function canAccessJournal(user,journal) {
  return user.role !== 'GURU' || journal.teacher_id === user.id;
}

const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    if (req.method==='POST' && path==='/api/auth/login') {
      const {code}=await body(req);
      const user=db.prepare('SELECT id,code,name,role FROM users WHERE code=? AND active=1').get(String(code||'').trim().toUpperCase());
      if (!user) return json(res,401,{error:'INVALID_CODE'});
      const token=crypto.randomBytes(32).toString('hex');
      sessions.set(token,user);
      res.setHeader('Set-Cookie',`rejasa_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
      return json(res,200,{user});
    }

    if (req.method==='POST' && path==='/api/auth/logout') {
      const token=parseCookies(req).rejasa_session;
      if (token) sessions.delete(token);
      res.setHeader('Set-Cookie','rejasa_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
      return json(res,200,{ok:true});
    }

    if (req.method==='GET' && path==='/api/auth/me') {
      const user=userFromRequest(req);
      return json(res,200,{user:user||null});
    }

    const qrMatch=path.match(/^\/api\/qr\/([^/]+)$/);
    if (req.method==='GET' && qrMatch) {
      const qr=db.prepare(`
        SELECT q.token,q.lab_id,l.code lab_code,l.name lab_name
        FROM qr_codes q JOIN labs l ON l.id=q.lab_id
        WHERE q.token=? AND q.active=1
      `).get(qrMatch[1]);
      if (!qr) return json(res,404,{error:'QR_NOT_FOUND'});
      return json(res,200,{token:qr.token,lab:publicLab({id:qr.lab_id,code:qr.lab_code,name:qr.lab_name})});
    }

    if (req.method==='POST' && path==='/api/qr') {
      const user=requireAuth(req,res,['ADMIN']);
      if (!user) return;
      const {labId}=await body(req);
      const lab=db.prepare('SELECT * FROM labs WHERE id=?').get(labId);
      if (!lab) return json(res,404,{error:'LAB_NOT_FOUND'});
      const token=crypto.randomBytes(18).toString('base64url');
      const id=crypto.randomUUID();
      db.prepare('INSERT INTO qr_codes (id,token,lab_id,created_at) VALUES (?,?,?,?)').run(id,token,lab.id,now());
      return json(res,201,{token,lab:publicLab(lab)});
    }

    const labMatch=path.match(/^\/api\/labs\/([^/]+)$/);
    if (req.method==='GET' && labMatch) {
      const lab=db.prepare('SELECT * FROM labs WHERE id=?').get(labMatch[1]);
      if (!lab) return json(res,404,{error:'LAB_NOT_FOUND'});
      return json(res,200,{lab:publicLab(lab)});
    }
    const scheduleMatch=path.match(/^\/api\/labs\/([^/]+)\/schedule$/);
    if (req.method==='GET' && scheduleMatch) {
      const user=requireAuth(req,res,['ADMIN','LABORAN','GURU']);
      if (!user) return;
      const date=url.searchParams.get('date') || new Date().toISOString().slice(0,10);
      const rows=db.prepare('SELECT id,date,start_time,end_time,class_name,activity FROM schedules WHERE lab_id=? AND date=? ORDER BY start_time').all(scheduleMatch[1],date);
      return json(res,200,{schedules:rows});
    }

    if (req.method==='GET' && path==='/api/journals') {
      const user=requireAuth(req,res,['ADMIN','LABORAN']);
      if (!user) return;
      const rows=db.prepare(`
        SELECT j.*, l.code lab_code,l.name lab_name,u.name teacher_name
        FROM journals j JOIN labs l ON l.id=j.lab_id JOIN users u ON u.id=j.teacher_id
        ORDER BY j.created_at DESC
      `).all();
      return json(res,200,{journals:rows.map(publicJournal)});
    }

    if (req.method==='GET' && path==='/api/journals/me') {
      const user=requireAuth(req,res,['GURU']);
      if (!user) return;
      const rows=db.prepare(`
        SELECT j.*, l.code lab_code,l.name lab_name,u.name teacher_name
        FROM journals j JOIN labs l ON l.id=j.lab_id JOIN users u ON u.id=j.teacher_id
        WHERE j.teacher_id=? ORDER BY j.created_at DESC
      `).all(user.id);
      return json(res,200,{journals:rows.map(publicJournal)});
    }

    const journalMatch=path.match(/^\/api\/journals\/([^/]+)$/);
    if (req.method==='GET' && journalMatch) {
      const user=requireAuth(req,res,['ADMIN','LABORAN','GURU']);
      if (!user) return;
      const j=journalById(journalMatch[1]);
      if (!j) return json(res,404,{error:'JOURNAL_NOT_FOUND'});
      if (!canAccessJournal(user,j)) return json(res,403,{error:'FORBIDDEN'});
      return json(res,200,{journal:publicJournal(j)});
    }

    if (req.method==='POST' && path==='/api/journals') {
      const user=requireAuth(req,res,['GURU']);
      if (!user) return;
      const data=await body(req);
      const lab=db.prepare('SELECT * FROM labs WHERE id=?').get(data.labId);
      if (!lab) return json(res,404,{error:'LAB_NOT_FOUND'});
      const schedule=data.scheduleId ? db.prepare('SELECT * FROM schedules WHERE id=? AND lab_id=?').get(data.scheduleId,lab.id) : null;
      if (data.scheduleId && !schedule) return json(res,400,{error:'INVALID_SCHEDULE'});
      const id=crypto.randomUUID(), timestamp=now();
      const code=journalCode();
      db.prepare(`
        INSERT INTO journals
        (id,code,lab_id,teacher_id,schedule_id,date,time,class_name,subject,activity,notes,students_count,status,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(id,code,lab.id,user.id,schedule?.id||null,data.date||new Date().toISOString().slice(0,10),
        data.time||'',data.className||'',data.subject||'',data.activity||'',data.notes||'',Number(data.studentsCount||0),'SUBMITTED',timestamp,timestamp);
      return json(res,201,{journal:publicJournal(journalById(id))});
    }

    if (req.method==='PATCH' && journalMatch) {
      const user=requireAuth(req,res,['GURU']);
      if (!user) return;
      const j=journalById(journalMatch[1]);
      if (!j || j.teacher_id!==user.id) return json(res,404,{error:'JOURNAL_NOT_FOUND'});
      if (j.status!=='NEEDS_CORRECTION') return json(res,409,{error:'JOURNAL_NOT_EDITABLE'});
      const data=await body(req);
      db.prepare(`
        UPDATE journals SET class_name=?,subject=?,activity=?,notes=?,students_count=?,updated_at=? WHERE id=?
      `).run(data.className??j.class_name,data.subject??j.subject,data.activity??j.activity,data.notes??j.notes,
        data.studentsCount??j.students_count,now(),j.id);
      return json(res,200,{journal:publicJournal(journalById(j.id))});
    }

    const reviewMatch=path.match(/^\/api\/journals\/([^/]+)\/reviews$/);
    if (req.method==='GET' && reviewMatch) {
      const user=requireAuth(req,res,['ADMIN','LABORAN','GURU']);
      if (!user) return;
      const j=journalById(reviewMatch[1]);
      if (!j) return json(res,404,{error:'JOURNAL_NOT_FOUND'});
      if (!canAccessJournal(user,j)) return json(res,403,{error:'FORBIDDEN'});
      const rows=db.prepare(`
        SELECT r.id,r.status,r.notes,r.created_at,u.name reviewer_name,u.role reviewer_role
        FROM journal_reviews r JOIN users u ON u.id=r.reviewer_id
        WHERE r.journal_id=? ORDER BY r.created_at ASC
      `).all(j.id);
      return json(res,200,{reviews:rows});
    }

    if (req.method==='POST' && reviewMatch) {
      const user=requireAuth(req,res,['ADMIN','LABORAN']);
      if (!user) return;
      const j=journalById(reviewMatch[1]);
      if (!j) return json(res,404,{error:'JOURNAL_NOT_FOUND'});
      const data=await body(req);
      const status=['REVIEWED','NEEDS_CORRECTION'].includes(data.status) ? data.status : null;
      if (!status) return json(res,400,{error:'INVALID_REVIEW_STATUS'});
      const timestamp=now();
      db.prepare('INSERT INTO journal_reviews (id,journal_id,reviewer_id,status,notes,created_at) VALUES (?,?,?,?,?,?)')
        .run(crypto.randomUUID(),j.id,user.id,status,data.notes||'',timestamp);
      db.prepare('UPDATE journals SET status=?,notes=?,updated_at=? WHERE id=?').run(status,data.notes||j.notes,timestamp,j.id);
      return json(res,200,{journal:publicJournal(journalById(j.id))});
    }

    const resubmitMatch=path.match(/^\/api\/journals\/([^/]+)\/resubmit$/);
    if (req.method==='POST' && resubmitMatch) {
      const user=requireAuth(req,res,['GURU']);
      if (!user) return;
      const j=journalById(resubmitMatch[1]);
      if (!j || j.teacher_id!==user.id) return json(res,404,{error:'JOURNAL_NOT_FOUND'});
      if (j.status!=='NEEDS_CORRECTION') return json(res,409,{error:'JOURNAL_NOT_READY_FOR_RESUBMIT'});
      const timestamp=now();
      db.prepare('UPDATE journals SET status=\'SUBMITTED\',updated_at=? WHERE id=?').run(timestamp,j.id);
      db.prepare('INSERT INTO journal_reviews (id,journal_id,reviewer_id,status,notes,created_at) VALUES (?,?,?,?,?,?)')
        .run(crypto.randomUUID(),j.id,user.id,'RESUBMITTED','Jurnal diperbaiki dan dikirim ulang.',timestamp);
      return json(res,200,{journal:publicJournal(journalById(j.id))});
    }

    if (path.startsWith('/api/inventory')) {
      const user=requireAuth(req,res,['ADMIN']);
      if (!user) return;
      return json(res,200,{items:[]});
    }

    json(res,404,{error:'NOT_FOUND'});
  } catch (error) {
    console.error(error);
    json(res,500,{error:'INTERNAL_SERVER_ERROR',message:error.message});
  }
});

server.listen(PORT,()=>console.log(`REJASA API listening on http://localhost:${PORT}`));
