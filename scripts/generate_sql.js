const fs = require('fs');

const classes = [
  {id:'c1',name:'Kelas 1',year:'2024/2025'},{id:'c2',name:'Kelas 2',year:'2024/2025'},
  {id:'c3',name:'Kelas 3',year:'2024/2025'},{id:'c4',name:'Kelas 4',year:'2024/2025'},
  {id:'c5',name:'Kelas 5',year:'2024/2025'},{id:'c6',name:'Kelas 6',year:'2024/2025'},
];

// We will extract students from the data.ts file using regex or simple parsing
const content = fs.readFileSync('src/lib/data.ts', 'utf8');

const regex1 = /export const class1Students.*?\[(.*?)\];/s;
const regex2 = /export const class2Students.*?\[(.*?)\];/s;
const regex3 = /export const class3Students.*?\[(.*?)\];/s;
const regex4 = /export const class4Students.*?\[(.*?)\];/s;
const regex5 = /export const class5Students.*?\[(.*?)\];/s;
const regex6 = /export const class6Students.*?\[(.*?)\];/s;

function parseStudents(regex) {
  const match = content.match(regex);
  if (!match) return [];
  const lines = match[1].split('\n').filter(l => l.includes('{'));
  return lines.map(line => {
    const nameMatch = line.match(/name:\s*\"(.*?)\"/);
    const nisMatch = line.match(/nis:\s*\"(.*?)\"/);
    const nisnMatch = line.match(/nisn:\s*\"(.*?)\"/);
    if (nameMatch && nisMatch) {
      return {
        name: nameMatch[1],
        nis: nisMatch[1],
        nisn: nisnMatch ? nisnMatch[1] : ''
      };
    }
    return null;
  }).filter(Boolean);
}

const c1 = parseStudents(regex1);
const c2 = parseStudents(regex2);
const c3 = parseStudents(regex3);
const c4 = parseStudents(regex4);
const c5 = parseStudents(regex5);
const c6 = parseStudents(regex6);

let sql = `
-- PAIBP Students Database Dump
-- Generated automatically

CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50),
  year VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  nis VARCHAR(20),
  nisn VARCHAR(20),
  name VARCHAR(100),
  classId VARCHAR(10)
);

INSERT INTO classes (id, name, year) VALUES 
('c1', 'Kelas 1', '2024/2025'),
('c2', 'Kelas 2', '2024/2025'),
('c3', 'Kelas 3', '2024/2025'),
('c4', 'Kelas 4', '2024/2025'),
('c5', 'Kelas 5', '2024/2025'),
('c6', 'Kelas 6', '2024/2025');

`;

function generateInserts(students, classId) {
  if (students.length === 0) return '';
  let query = 'INSERT INTO students (id, nis, nisn, name, classId) VALUES \n';
  students.forEach((s, idx) => {
    const isLast = idx === students.length - 1;
    const sId = `${classId}_${idx}`;
    query += `('${sId}', '${s.nis}', '${s.nisn}', '${s.name.replace(/'/g, "''")}', '${classId}')${isLast ? ';' : ','}\n`;
  });
  return query + '\n';
}

sql += generateInserts(c1, 'c1');
sql += generateInserts(c2, 'c2');
sql += generateInserts(c3, 'c3');
sql += generateInserts(c4, 'c4');
sql += generateInserts(c5, 'c5');
sql += generateInserts(c6, 'c6');

fs.writeFileSync('paibp_students.sql', sql);
console.log('SQL file created!');
