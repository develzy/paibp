export const DB = {
  get(k: string) { try { return JSON.parse(localStorage.getItem('paibp_'+k) || '[]') || [] } catch { return [] } },
  set(k: string, v: any) { localStorage.setItem('paibp_'+k, JSON.stringify(v)) },
  getObj(k: string) { try { return JSON.parse(localStorage.getItem('paibp_'+k) || 'null') } catch { return null } },
  setObj(k: string, v: any) { localStorage.setItem('paibp_'+k, JSON.stringify(v)) }
};

export const DEFAULT_USER_INITIAL = { username:'guru', password:'paibp123', name:'Guru PAIBP' };

export function getProfile() { 
  return DB.getObj('profile') || { name:'Guru PAIBP', nip:'', school:'', subject:'Pendidikan Agama Islam dan Budi Pekerti' }; 
}

export function saveProfile(p: any) { 
  DB.setObj('profile', p); 
}

export function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Tahun ajaran baru di Indonesia biasanya dimulai pertengahan Juli
  if (month >= 7) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}


export const class1Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "ADFIN LOIN PRATAMA", nis: "4644", nisn: "3181571403" },
  { name: "AFSHI MAULA AZAHRA", nis: "4645", nisn: "3194913376" },
  { name: "AHMAD UMAY REZA SAPUTRA", nis: "4646", nisn: "3183123462" },
  { name: "AINUN SHAKILA FEBRIANI", nis: "4647", nisn: "3193485376" },
  { name: "AISYAH NUSAIBAH ABDULLAH", nis: "4648", nisn: "3199688695" },
  { name: "AISYAH SHIDQIA RAMADHANI", nis: "4649", nisn: "3191364451" },
  { name: "AKHTAR ZIDANE PRADITA", nis: "4650", nisn: "3192441611" },
  { name: "AKIFA NAILA", nis: "4651", nisn: "3187778549" },
  { name: "ALZAN ATHAR HAMIZAN", nis: "4652", nisn: "3193470146" },
  { name: "ARSY OKTAVIANI", nis: "4653", nisn: "3189473148" },
  { name: "DEA LESTARI", nis: "4654", nisn: "3195743164" },
  { name: "HILDA APRILIANI", nis: "4655", nisn: "3188879475" },
  { name: "KAHYANG OKTA ANGGRAINI", nis: "4656", nisn: "3195743164" },
  { name: "KANAYATUL MARYAM", nis: "4657", nisn: "3196053053" },
  { name: "KHAERUL MIZWAN", nis: "4658", nisn: "3192681581" },
  { name: "M. HAFIDZ ARIANSYAH", nis: "4659", nisn: "3185968058" },
  { name: "M.NAZRIL MAULANA YUSUP", nis: "4660", nisn: "3185807810" },
  { name: "MEDINA HADI SHAFIRA", nis: "4662", nisn: "3192681581" },
  { name: "MOHAMAD JAKA BILAL IBRAHIM", nis: "4663", nisn: "3194465408" },
  { name: "MOH. ERWIN AL KHASBI", nis: "4664", nisn: "3180041343" },
  { name: "MUHAMAD ARSA MAULANA", nis: "4665", nisn: "3172914312" },
  { name: "MUHAMAD ARYA MAOLANA", nis: "4666", nisn: "3179560296" },
  { name: "MUHAMMAD FAQIH SYAPUTRA", nis: "4667", nisn: "3195441369" },
  { name: "MUHAMAD AL AQSO", nis: "4668", nisn: "3185032825" },
  { name: "MUHAMMAD ABDUL MUIZ", nis: "4669", nisn: "3182870970" },
  { name: "MUHAMMAD KEANU", nis: "4670", nisn: "3181635758" },
  { name: "NESYA KARTIKA DEWI", nis: "4671", nisn: "3187418273" },
  { name: "RANIA NOVA PUTRI", nis: "4672", nisn: "3183741719" },
  { name: "RANIA RAMADANI", nis: "4673", nisn: "3194294239" },
  { name: "SITI ALIFAH NAZIRA", nis: "4674", nisn: "3180161004" },
  { name: "SITI AYU SALU", nis: "4675", nisn: "3194373627" },
  { name: "WAFI ILHAM MULYONO", nis: "4676", nisn: "3197646592" }
];

export const class2Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "ADIVA EVRILLYANI ASPURI", nis: "4591", nisn: "3182214197" },
  { name: "AHMAD AZRIL ALFARIQ", nis: "4593", nisn: "3175172541" },
  { name: "AHMAD MARWAN", nis: "4594", nisn: "3178825420" },
  { name: "AINAYYA FATHIYYATURAHMA", nis: "4595", nisn: "3189859809" },
  { name: "AISYAH ATTA ZAHIRA", nis: "4597", nisn: "3175829258" },
  { name: "ALEXA VELOVIE RAMADHANI", nis: "4598", nisn: "3186825350" },
  { name: "ALIA RAMADHANI", nis: "4599", nisn: "3179055670" },
  { name: "ALWI ALFATIH", nis: "4600", nisn: "3178407243" },
  { name: "AQILA NAYLA PUTRI", nis: "4601", nisn: "3183360479" },
  { name: "AQILAH AYU SANTOSO", nis: "4602", nisn: "3186804245" },
  { name: "ARFAN ATHAFARIS AWWAB", nis: "4603", nisn: "3170970786" },
  { name: "ARRAFIF FATHUL ISLAM", nis: "4604", nisn: "3181391992" },
  { name: "AYRA NUR SAFITRI", nis: "4605", nisn: "3189673900" },
  { name: "CAHAYA SALSABILA GUNAWAN", nis: "4606", nisn: "3170370218" },
  { name: "FATIMAH", nis: "4607", nisn: "3180022038" },
  { name: "FATTIYA TURAHMA", nis: "4608", nisn: "3184531653" },
  { name: "FIRDHAN ZAKIRUL HAFIZH", nis: "4609", nisn: "3188617238" },
  { name: "HAFIZ HIDAYATUL PRATAMA", nis: "4610", nisn: "3188646668" },
  { name: "HILWA HANUM IMANDA", nis: "4611", nisn: "3182560294" },
  { name: "KHANIFAH ALMAHIRA", nis: "4612", nisn: "3182321444" },
  { name: "KHARISMATUL KHUSNA", nis: "4613", nisn: "3178147123" },
  { name: "M. DAFFIAN DZIKRI AL HAFIDZ", nis: "4614", nisn: "3181488106" },
  { name: "M. GILANG ALFARIZI", nis: "4615", nisn: "3175719425" },
  { name: "M. IKBAL AJI SAPUTRA", nis: "4616", nisn: "3170254958" },
  { name: "MOH.ARBIAN SANDYA", nis: "4617", nisn: "3170889635" },
  { name: "MOHAMAD AMIRUL ARIF", nis: "4618", nisn: "3171841464" },
  { name: "MOHAMAD RAMADHANI", nis: "4620", nisn: "3176339919" },
  { name: "MOHAMMAD HAIDAR NASHIH", nis: "4621", nisn: "3184666176" },
  { name: "MUCHAMAD RADEN ALFATIKH", nis: "4622", nisn: "3176889915" },
  { name: "MUHAMAD HAFIZH", nis: "4623", nisn: "3187659061" },
  { name: "MUHAMMAD FAJRI ARDIANSYAH", nis: "4624", nisn: "3178770732" },
  { name: "MUHAMMAD FIZAN SETIYAWAN", nis: "4625", nisn: "3175131964" },
  { name: "MUHAMMAD JAWAD AL HAKIM", nis: "4626", nisn: "3170680472" },
  { name: "MUHAMMAD VAREN IRAWAN", nis: "4627", nisn: "3181053243" },
  { name: "NAIRA SHIDKIA RAMADHANI", nis: "4628", nisn: "3182774538" },
  { name: "NASYA AYU SEPTIANI", nis: "4629", nisn: "3179075511" },
  { name: "NAZMA SYAFA ALISYA", nis: "4630", nisn: "3182908580" },
  { name: "RARA PUTRI DIANA", nis: "4631", nisn: "3173417169" },
  { name: "RIFKI ADITYA", nis: "4632", nisn: "3182464263" },
  { name: "SALMA NISYABILA PUTRI", nis: "4633", nisn: "3183325570" },
  { name: "SALSABILA ROHADATUL AISY", nis: "4634", nisn: "3181071978" },
  { name: "SHALUNA ZAZKIA FITRI", nis: "4635", nisn: "3186227421" },
  { name: "TALITA MAYASARI", nis: "4636", nisn: "3180948453" },
  { name: "TSAMARA AINAYYA HASNA", nis: "4637", nisn: "3181728719" },
  { name: "ZULAIKHA AYUNINDIA INARA", nis: "4639", nisn: "3181825894" }
];

export const class3Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "ABIKA QIRANIA AOZORA", nis: "4540", nisn: "3176925911" },
  { name: "ABIZAR MUMTAZ ALFARIZI", nis: "4541", nisn: "3163543399" },
  { name: "AFLI AL SIDQI R", nis: "4542", nisn: "3172933946" },
  { name: "AHMAD ADAM FASLAH", nis: "4543", nisn: "3164435349" },
  { name: "AHMAD RIO AKHSANI", nis: "4544", nisn: "3163005423" },
  { name: "AL REZQY HASANUDIN", nis: "4545", nisn: "3163238222" },
  { name: "ANDI IRWAN", nis: "4547", nisn: "3131338705" },
  { name: "ANIK ARNIKA SAPUTRI", nis: "4548", nisn: "3179872335" },
  { name: "ANNASYA PUTRI ISNAINI", nis: "4549", nisn: "3168674205" },
  { name: "ARSY APRILI RIYANI", nis: "4550", nisn: "3171507617" },
  { name: "AYASH ABDILLAH HADIF", nis: "4551", nisn: "3166772028" },
  { name: "AZKA ARIF NUR ZAMAN", nis: "4552", nisn: "3163001712" },
  { name: "DARA PUSPITA", nis: "4554", nisn: "3162539609" },
  { name: "DIVEN FAJAR ARDIANSYAH", nis: "4555", nisn: "3176149065" },
  { name: "FAJAR AL GHIFARI", nis: "4556", nisn: "3174463403" },
  { name: "FALIH NABHAN MUSYAFFA", nis: "4557", nisn: "3179852539" },
  { name: "HESTI NEHIA", nis: "4558", nisn: "3179644139" },
  { name: "JIHAN TRI AYUNDA H.", nis: "4559", nisn: "3175186128" },
  { name: "JUNISAH", nis: "4560", nisn: "3168641279" },
  { name: "KHOERUL RIZI AKBAR", nis: "4561", nisn: "3161721868" },
  { name: "M. AFIK NUR AZIZ", nis: "4562", nisn: "3170963103" },
  { name: "M. DEVAN AL WIANSYAH", nis: "4563", nisn: "3178348117" },
  { name: "M. FURQON AL AFGANI", nis: "4564", nisn: "3177729779" },
  { name: "M. RIZKI SETIAWAN", nis: "4565", nisn: "3162042279" },
  { name: "MOH. DHAFA SAPUTRA", nis: "4566", nisn: "3167117420" },
  { name: "MOH. REVAL SETIAWAN", nis: "4567", nisn: "3179998206" },
  { name: "MUHAMMAD AZKA ADZANI", nis: "4569", nisn: "3161615486" },
  { name: "MUHAMMAD YUDHA PRATAMA", nis: "4571", nisn: "3174573238" },
  { name: "MUHAMMAD ZAKI ARDIANSYAH", nis: "4572", nisn: "3164566763" },
  { name: "NADIRA THAFANA ALINDRA", nis: "4573", nisn: "3179211358" },
  { name: "NAJWA SYIFA ANINDA", nis: "4574", nisn: "3170672737" },
  { name: "NAZMA DWI THISIKA", nis: "4575", nisn: "3167927430" },
  { name: "PUTRA SETIAWAN", nis: "4576", nisn: "3166994396" },
  { name: "RAVI NIZAR MAFAZA", nis: "4577", nisn: "0174187463" },
  { name: "RAYA FITRIYANI", nis: "4578", nisn: "3169369877" },
  { name: "RIRIN DWI NOVITA", nis: "4580", nisn: "3167943232" },
  { name: "RIZKIA DWI FITRI", nis: "4581", nisn: "3164190240" },
  { name: "SAEFUL ANAM", nis: "4582", nisn: "3151924654" },
  { name: "SALMAN AL FARIZI", nis: "4583", nisn: "3128197621" },
  { name: "SHAQILA AZMI LATIFAH", nis: "4584", nisn: "3164265117" },
  { name: "SITI NURUL AISYAH", nis: "4585", nisn: "3176516320" },
  { name: "ZAHWA AFIQAH PUTRI", nis: "4586", nisn: "3160655531" }
];

export const class4Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "MUHAMAD ARFI PUTRA PRATAMA", nis: "4492", nisn: "3154769762" },
  { name: "MUHAMAD FAJAR", nis: "4494", nisn: "3140992827" },
  { name: "SALSA HAURA RAMADANI", nis: "4505", nisn: "3143064009" },
  { name: "ALIKA NAILA PUTRI", nis: "4516", nisn: "3153973294" },
  { name: "DINI MEISYA ARYANI", nis: "4517", nisn: "3159135097" },
  { name: "IKA TALITA RAHMADANI", nis: "4518", nisn: "3162460413" },
  { name: "JUNAELI ARISKI SAPUTRA", nis: "4519", nisn: "3141582520" },
  { name: "M. AKMAL YUSUF", nis: "4520", nisn: "3166806957" },
  { name: "M. ISMA ADITIA", nis: "4521", nisn: "3152638106" },
  { name: "MOH. ABID AQILA PRANAJA", nis: "4522", nisn: "3163583076" },
  { name: "MUHAMAD MAULANA ADHA", nis: "4523", nisn: "3153192399" },
  { name: "MUHAMMAD ADLI PRIYANA", nis: "4524", nisn: "3166319829" },
  { name: "MUHAMMAD ALVATIH PRATAMA", nis: "4525", nisn: "3158395823" },
  { name: "MUHAMMAD KEVIN SAPUTRA", nis: "4526", nisn: "3160472730" },
  { name: "NUR'AINUN BADARIYAH", nis: "4527", nisn: "3156701895" },
  { name: "RENDI FIRMANSYAH", nis: "4528", nisn: "3158996712" },
  { name: "REVA OKTAVIANI", nis: "4529", nisn: "3154700762" },
  { name: "RIZQY HIKMATULOH INDRAWAN", nis: "4531", nisn: "3152189085" },
  { name: "SANDI PEBRI ADI", nis: "4532", nisn: "3158080809" },
  { name: "SITI FEBIANA AIRA SYAFA", nis: "4534", nisn: "3163702173" },
  { name: "SITI JAYANTI", nis: "4535", nisn: "3156717400" },
  { name: "SITI ZAH REEFA SEPTIANI", nis: "4536", nisn: "3150782348" },
  { name: "MUHAMAD ARIFIN ILHAM", nis: "4539", nisn: "3150669313" },
  { name: "ALESHA FAIHA SELOWITA", nis: "4587", nisn: "3167269901" }
];

export const class5Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "KAYLA FEBIYAS TARI", nis: "4426", nisn: "3141701144" },
  { name: "MUHAMAD RAPKAH PRATAMA", nis: "4440", nisn: "3130284838" },
  { name: "ABDUL GHOFAR", nis: "4466", nisn: "3150036197" },
  { name: "ABU DZAR ALGHIFARI", nis: "4410", nisn: "3138127483" },
  { name: "ADEEVA DWI ANEIRA", nis: "4467", nisn: "0141138854" },
  { name: "ADELIA KUSUMA RAHMAWATI", nis: "4468", nisn: "3144740843" },
  { name: "AHMAD RENDRA ALVANO", nis: "4469", nisn: "0149508165" },
  { name: "AISYAH NUR SA'ADAH", nis: "4470", nisn: "3148851165" },
  { name: "ANUGRAH ZAERA", nis: "4473", nisn: "3151879583" },
  { name: "ARYO HADI PRATAMA", nis: "4475", nisn: "3150752012" },
  { name: "ARZETI AVITASARI", nis: "4476", nisn: "3142423143" },
  { name: "EARLYTA ARSIFA OKTAFIANI", nis: "4477", nisn: "3141882407" },
  { name: "GUNTUR PUTRA ADITYA", nis: "4478", nisn: "3148504388" },
  { name: "HANI AGUSTINA FARIDIN", nis: "4479", nisn: "3149452947" },
  { name: "INDI RAHMAWATI", nis: "4425", nisn: "3136999124" },
  { name: "ISCO ALFIYANO", nis: "4480", nisn: "0142805922" },
  { name: "LINDAN ANJAS MORO", nis: "4481", nisn: "3153985697" },
  { name: "LIZA ANISAH", nis: "4428", nisn: "3139418764" },
  { name: "M. ARFA GLORY NIVIYANTO", nis: "4482", nisn: "3151706938" },
  { name: "M. AZKA AL GHIFARI RAMADHAN", nis: "4483", nisn: "3146144428" },
  { name: "M. GALANG SAPUTRA", nis: "4484", nisn: "3147929715" },
  { name: "M. NIZAM ABIZAR", nis: "4485", nisn: "3154571194" },
  { name: "M. RAFA AL AHYARI", nis: "4486", nisn: "3153754015" },
  { name: "M. YOSI FEBIYAN", nis: "4487", nisn: "3159925905" },
  { name: "MAHARANI CHINTIA DESTY", nis: "4488", nisn: "3144320627" },
  { name: "MARIZKA DWI UMAYAH", nis: "4489", nisn: "3144550945" },
  { name: "MOH. KHOERUL ARIFIN", nis: "4490", nisn: "3154425255" },
  { name: "MOHAMAD GUFRON", nis: "4491", nisn: "3146177427" },
  { name: "MUHAMAD DIDIK SETIAWAN", nis: "4493", nisn: "3155452568" },
  { name: "MUHAMAD RIZKI ALFIAN", nis: "4495", nisn: "3154972676" },
  { name: "MUHAMMAD ALFATIH", nis: "4496", nisn: "3153066948" },
  { name: "MUHAMMAD BINTANG ALHAFIZ", nis: "4497", nisn: "3154787264" },
  { name: "NAFA SEPTIANA PUTRI", nis: "4499", nisn: "3145374579" },
  { name: "NINDI NURHASANAH PUTRI", nis: "4500", nisn: "3154423984" },
  { name: "RATNA AZIZAH", nis: "4448", nisn: "3146862188" },
  { name: "RATNA SARI", nis: "4501", nisn: "3149410691" },
  { name: "RIFKI HALIZAN", nis: "4502", nisn: "3155958259" },
  { name: "SHAKILA BALQIS", nis: "4506", nisn: "3144281244" },
  { name: "SYAHDAN AL KAHFI HAMIZAN", nis: "4507", nisn: "3156663508" },
  { name: "TASYA RISTIANA", nis: "4508", nisn: "3152022199" },
  { name: "TIYA AULIYANTI", nis: "4509", nisn: "3149373839" },
  { name: "TOMI SUNARTO PUTRA", nis: "4510", nisn: "3153609128" },
  { name: "VIZA NAZIMA", nis: "4511", nisn: "3153852370" },
  { name: "WILDAN FIKI RAMADHAN", nis: "4512", nisn: "3149757533" },
  { name: "YUSUF MAULANA", nis: "4513", nisn: "3148629632" },
  { name: "ZULFIANA AGUSTIN", nis: "4515", nisn: "3145022547" },
  { name: "MUHAMMAD ABID AQILA RAJENDRA", nis: "4538", nisn: "3155780848" },
  { name: "SYIFA AULIA SADLY", nis: "4583", nisn: "0135749855" },
  { name: "VIRNA APRILLIA AZIZAH", nis: "4640", nisn: "3142427061" },
  { name: "VIRNI APRILLIA AZIZAH", nis: "4641", nisn: "3145816859" },
  { name: "MUHAMMAD RAGIL MI'ROJI", nis: "4643", nisn: "0144151480" }
];

export const class6Students: { name: string, nis: string, nisn?: string }[] = [
  { name: "SAHRINI AMBARWATI", nis: "4405", nisn: "3138885290" },
  { name: "ADZKIA MEILLYAH BILQIES", nis: "4411", nisn: "0146940696" },
  { name: "AFIZAH ROSMASARI", nis: "4413", nisn: "3130983355" },
  { name: "AHMAD ARIPANTO", nis: "4414", nisn: "0141384443" },
  { name: "AHMAD PRASETIO", nis: "4366", nisn: "3133897130" },
  { name: "AINI YUAN AEVIANI", nis: "4367", nisn: "0132252762" },
  { name: "ARANA NUR ASHADIYAH", nis: "4415", nisn: "3147910782" },
  { name: "ARJUNA DWI ARAFFA", nis: "4416", nisn: "0142953587" },
  { name: "AZAM MUKHAMAD SEPTYAWAN", nis: "4418", nisn: "3141739984" },
  { name: "AZRIEL TIANSYAH", nis: "4419", nisn: "0137336274" },
  { name: "DINI AZZAHRANI", nis: "4420", nisn: "3130539105" },
  { name: "DIVA NOVELIA PUTRI TARYONO", nis: "4421", nisn: "3137256183" },
  { name: "ELSA NOVIANA KHANZA", nis: "4422", nisn: "3135865972" },
  { name: "ERVINA DWI ENDRA", nis: "4423", nisn: "3133904710" },
  { name: "FARAH AZZAHRA HIDAYAT", nis: "4424", nisn: "3142794739" },
  { name: "HAFIZ ALIYYUL HAQ", nis: "4463", nisn: "0144449365" },
  { name: "KHANZA NUR ZAHIRAH", nis: "4427", nisn: "0144066138" },
  { name: "M. AKHLIS SAPUTRA", nis: "4429", nisn: "3134817256" },
  { name: "MOH. FADLI", nis: "4430", nisn: "3116319807" },
  { name: "MOH. SONY NUR SABATA", nis: "4431", nisn: "3142267299" },
  { name: "MOH. SLAMET", nis: "4392", nisn: "3112088721" },
  { name: "MOH. ZIDNI ILYAS", nis: "4432", nisn: "3143307384" },
  { name: "MOHAMMAD LUTFY RAMADHANI", nis: "4433", nisn: "0142236343" },
  { name: "MUHAMAD SOLEH IBROHIM", nis: "4435", nisn: "3141297467" },
  { name: "MUHAMMAD AL HABSY", nis: "4436", nisn: "0136252755" },
  { name: "MUHAMMAD ALDI ROBIANSYAH", nis: "4437", nisn: "0138951429" },
  { name: "MUHAMMAD LIAN FIRANSYAH", nis: "4438", nisn: "0145616726" },
  { name: "MUHAMMAD NIZAM MAULANA", nis: "4439", nisn: "3130284838" },
  { name: "MUKHAMMAD ADIT SEBASTIAN", nis: "4441", nisn: "3149173826" },
  { name: "NADHIFA BATRISYA HAYFA", nis: "4442", nisn: "3140403575" },
  { name: "NADIFA SADLIKIAH", nis: "4443", nisn: "0145534858" },
  { name: "NAJWA IZZATUNNISA", nis: "4444", nisn: "0148125976" },
  { name: "NAYSILA KHANZA AWLIYA", nis: "4445", nisn: "3136775311" },
  { name: "NIKEN APRILIA YASMIN", nis: "4446", nisn: "3140948844" },
  { name: "NIKITA FEBRIANI", nis: "4447", nisn: "3142863210" },
  { name: "REVAN AZKA ZULFAHMI", nis: "4449", nisn: "0146189735" },
  { name: "SA'I BAKTI PANGESTU", nis: "4450", nisn: "3133621996" },
  { name: "SELFIA DWI ANGGRAENI", nis: "4452", nisn: "3145710190" },
  { name: "SITI AISYAH CAHAYA PUTRI", nis: "4453", nisn: "3135871185" },
  { name: "SITI LISAH INDRIYANI", nis: "4454", nisn: "0142312924" },
  { name: "TAUFIQILLAH RIFKI FADHILLAH", nis: "4455", nisn: "3140297101" },
  { name: "UFAIRA NUR AFIFAH", nis: "4456", nisn: "3134259910" },
  { name: "WINDI LAUDIYA RIZKIYANA", nis: "4457", nisn: "0145811008" },
  { name: "WISNU NUGEROHO", nis: "4458", nisn: "3128050509" },
  { name: "ZA'ALAN PAEZA", nis: "4409", nisn: "3136074442" },
  { name: "AZZAM ZULFADHLI", nis: "4589", nisn: "0133859071" },
  { name: "AFIKA VIERANIA", nis: "4642", nisn: "0138757879" }
];

export function seedDummyData() {
  if (typeof window === 'undefined') return;
  
  // Seed Users if not exists
  const existingUsers = DB.get('users');
  if (existingUsers.length === 0) {
    DB.set('users', [DEFAULT_USER_INITIAL]);
  }

  if (localStorage.getItem('paibp_seeded_v6_dbauth')) return;
  
  const currentYear = getCurrentAcademicYear();
  const dummyClasses = [
    {id:'c1',name:'Kelas 1',year:currentYear},{id:'c2',name:'Kelas 2',year:currentYear},{id:'c3',name:'Kelas 3',year:currentYear},
    {id:'c4',name:'Kelas 4',year:currentYear},{id:'c5',name:'Kelas 5',year:currentYear},{id:'c6',name:'Kelas 6',year:currentYear},
  ];
  
  const dummyStudents: any[] = [];
  
  class1Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s0${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c1' });
  });

  class2Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s2_${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c2' });
  });

  class3Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s3_${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c3' });
  });

  class4Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s4_${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c4' });
  });

  class5Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s5_${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c5' });
  });

  class6Students.forEach((s, idx) => {
    dummyStudents.push({ id: `s6_${idx}`, nis: s.nis, nisn: s.nisn || '', name: s.name, classId: 'c6' });
  });

  DB.set('classes', dummyClasses);
  DB.set('students', dummyStudents);
  DB.set('weekly', []);
  DB.set('sas', []);
  DB.set('practice', []);
  DB.set('asaj', []);
  localStorage.setItem('paibp_seeded_v6_dbauth', 'true');
}
