db.adminCommand({listDatabases:1}).databases.map(d=>d.name).filter(n=>!["admin","config","local"].includes(n)).sort().forEach(n=>{
  const d=db.getSiblingDB(n); d.getCollectionNames().sort().forEach(c=>print(n+"."+c+" "+d.getCollection(c).countDocuments({})))});
