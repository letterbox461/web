const db = "Technology";

const getMarkers = ({ date, table, shift }) => {
  return `Select id,Позиция, Раскладка, материал,номерлир,колслоев,смена from ${db}.dbo.Раскрой where стол='${table}' and датаплан='${date}' and Раскроен is null  order by позиция,id;`;
};

const getLastSpreadingID = () => {
  return `select max(id) as id from [${db}].dbo.[настилы];`;
};

const createSpread = (marker, operator, table, id) => {
  return `insert into [${db}].dbo.[настилы] values (${id},${marker},getdate(),null,'${table}',null,0,'${operator}',null,null); `;
};

const getLengths = (arr) => {
  let q = `SELECT * FROM
  (SELECT cut.id,marker.Общая_длина,marker.Припуск
  FROM [${db}].[dbo].[Раскрой] as cut left join [${db}].dbo.[Раскладки] as marker on cut.idРаскладки=marker.id
  where nakt is null
  UNION all
  SELECT cut2.id,markerM.Общая_длина,0.02 as Припуск
  FROM [${db}].[dbo].[Раскрой] as cut2 left join [${db}].[dbo].[СлужЗапискиРаскладки] as markerM on cut2.Раскладка=markerM.Раскладка+'.' and cut2.NAKT=markerM.NAKT
  where cut2.NAKT is not null) as a where id=${arr[0]}`;

  q = q.replace(/\n/gi, " ");
  arr.forEach((e, index) => {
    if (index !== 0) {
      q += ` or id=${e}`;
    }
  });

  return q;
};

const getMarkerData = (table) => {
  let q = `
  DECLARE @table nvarchar(20)='${table}'
  SELECT ras.id, rask.[Раскладка],rask.[Модель],rask.[Комплект],rask.[Материал],round(rask.[Ширина_раскладки],3) as [Ширина_раскладки],rask.[Перестилы],rask.[Описание],round(rask.[Общая_длина],2) as Общая_длина,rask.[ParBul] as Параметры,rask.[Параметры_надсечек] as UoM,round(rask.[Станд_время],2) as [Станд_время] ,rask.[НомерЛир],rask.[Сверло1],rask.[Сверло2],rask.[ext],round(rask.[Припуск],2) as [Припуск],rask.[Примечание],round(ras.Длинна,3) as Всегомат,ras.Колслоев as Колслоев,nas.idНастила,ras.Ostatok
  FROM [${db}].[dbo].[Раскрой] as ras join
  (SELECT [idRask],[id] as idНастила
  FROM [${db}].[dbo].[Настилы] where NStol=@table and datae is null) as nas on nas.idRask=ras.id join 
  (SELECT id,[Раскладка],[Модель],[Комплект],[Материал],[Ширина_раскладки],[Перестилы],[Описание],[Общая_длина],[parbul],[Параметры_надсечек],[Станд_время],[НомерЛир],[Сверло1],[Сверло2],[ext],[Припуск],[Примечание]
  FROM [${db}].[dbo].[Раскладки]) as rask on rask.id=ras.idРаскладки
  UNION all
  SELECT ras2.id,rask2.[Раскладка],rask2.[Модель],rask2.[Комплект],rask2.[Материал],round(rask2.[Ширина_раскладки],3) as [Ширина_раскладки],rask2.[Перестилы],descr.descrip as описание,round(rask2.[Общая_длина],2)as Общая_длина,rask2.[Параметры],rask2.[Параметры_надсечек] as UoM,round(rask2.[Время],2) as [Станд_время] ,rask2.[НомерЛир],rask2.[Сверло1],rask2.[Сверло2],rask2.[ext],0.02 as [Припуск],rask2.[RasDescrip],round(ras2.Длинна,3) as Всегомат,ras2.Колслоев as Колслоев,nas2.idНастила,ras2.Ostatok
  FROM [${db}].[dbo].[Раскрой] as ras2 join
  (SELECT [idRask],[id] as idНастила
  FROM [${db}].[dbo].[Настилы] where NStol=@table and datae is null) as nas2 on nas2.idRask=ras2.id join
  (SELECT [NAKT],[Раскладка],[Модель],[Комплект],[Материал],[Ширина_раскладки],[Перестилы],[Общая_длина],[Параметры],[Параметры_надсечек],[НомерЛир],[Сверло1],[Сверло2],[ext],[Время],[RasDescrip]                                                                                 
  FROM [${db}].[dbo].[СлужЗапискиРаскладки]) as rask2 on rask2.nakt=ras2.nakt and rask2.Раскладка+'.'=ras2.Раскладка left join [${db}].[dbo].[СлужЗапискиПояснение] as descr on descr.ID=ras2.NAKT;`;

  return q.replace(/\n/gi, " ");
};

const getRollData = (idRoll) => {
  return `SELECT * FROM [Logistic].[dbo].[MaterialStorage] where idRul='${idRoll}';`;
};

const getMinPart = (НомерЛир) => {
  return `select min(Npart) as minPart from [Logistic].[dbo].[MaterialStorage] where   Bflash <>1 and status<>'red' and NLear='${НомерЛир}' and notFifo =0;`;
};

const getMaterialData = (pN) => {
  const q = `SELECT [Поставщик] as поставщик
  ,[Ширина] as ширина
  ,[Перекос рисунка] as перекосРисунка 
  ,[Ссылка] as ссылка   
  ,[descrip] as  descrip
  ,[Кол-во дефектов  триплирования] as колвоДефектовТриплирования
  ,[Расстояние между дефектами] as расстояниеМеждуДефектами
  ,[Компенсация] as компенсация
  ,[Намотка рулонов] as намоткаРулонов      
  ,[Лицо_материала] as лицоМатериала

FROM [Logistic].[dbo].[Поставщики]
where nlear='${pN}';`;
  return q.replace(/\n/gi, " ");
};

const checkCutoutLength = (nLear) => {
  return `SELECT [ДлКонцОст] FROM [Logistic].[dbo].[Поставщики] WHERE NLear='${nLear}';`;
};

const createCutout = (nLear, idRul, idНастила, length, type) => {
  const q = `INSERT INTO [${db}].[dbo].[НастилОстатки] ([NLear],[idRul],[idNastila],[Длинна],[распечатан],[закрыт],[УчтенныйБрак],[описание],[дата])
  VALUES ('${nLear}','${idRul}',${idНастила},${length},${
    type === "Учтенный брак" ||
    type === "Замины" ||
    type === "Не отмеченный брак"
      ? 1
      : 0
  },${
    type === "Учтенный брак" ||
    type === "Замины" ||
    type === "Не отмеченный брак"
      ? 1
      : 0
  },${type === "Учтенный брак" ? 1 : 0},'${type}',getdate());`;
  return q.replace(/\n/gi, " ");
};

const createLeftOver = (nLear, length, descrip) => {
  const q = `INSERT INTO  [${db}].[dbo].[KonOstatki] ([kol-vo],dat,LN,descript)
  VALUES (${length},cast(getdate() as date),'${nLear}','${descrip}');`;
  return q.replace(/\n/gi, " ");
};

const findCutout = (id) => {
  const q = `SELECT  [id],[NLear],[idRul],[idNastila],[Длинна],[распечатан],[закрыт],[УчтенныйБрак],[описание],[дата]
  FROM [${db}].[dbo].[НастилОстатки] where id=${id};`;
  return q.replace(/\n/gi, " ");
};

const addCutout = (idNastila, Длинна, NLear, idOst, idRul) => {
  const q = `INSERT INTO [${db}].[dbo].[НастилОстаткиДобавлено] ([idNastila],[Длинна],[NLear],[idOSt],[дата],[idRul])
  VALUES (${idNastila},${Длинна},'${NLear}',${idOst},getdate(),${idRul});`;
  return q.replace(/\n/gi, " ");
};

const getRollID = (rollNumber) => {
  return `SELECT idRul FROM [Logistic].[dbo].[MaterialStorage] where id='${rollNumber}';`;
};

const checkOpenedSpreads = (table) => {
  return `SELECT * FROM [${db}].[dbo].[Настилы] where closed=0 or closed is null and NStol='${table}'; `;
};

const setLabelPrint = (id) => {
  return `UPDATE [${db}].[dbo].[Раскрой] SET LabelPrint=1 where id=${id};`;
};

const lastMeasure = (idrulon, EndDat, idnastil) => {
  return `UPDATE [${db}].[dbo].[НастилРулоны] SET EndDat=${EndDat} where [idrulon]='${idrulon}' and [idnastil]=${idnastil};`;
};

const addRolltoSpread = (idНастила, idРулона, StartDat) => {
  const q = `INSERT into [${db}].[dbo].[НастилРулоны] ([idrulon],[idnastil],[dataRec],[StartDat],[EndDat])
  values ('${idРулона}',${idНастила},getdate(),${StartDat},NULL);`;
  return q.replace(/\n/gi, " ");
};

const closeRoll = (id) => {
  const q = `
  DECLARE @qfact int =(SELECT sum(EndDat-StartDat) FROM [${db}].[dbo].[НастилРулоны] where idrulon='${id}')
  UPDATE [Logistic].[dbo].[MaterialStorage] SET [BFlash]=1, [DataBFlash]=getdate(), [QuanFact]=@qfact where [idRul]='${id}';`;
  return q.replace(/\n/gi, " ");
};

const closeMarkers = (idРаскроя, QuanFact) => {
  return `UPDATE [${db}].[dbo].[Раскрой] 
  SET [ДатаРаскороя]=cast(getdate() as date), [Раскроен]=1, [QuanFact]=${QuanFact},[ЗавершениеНастила]=cast(getdate() as time) 
  where id=${idРаскроя};
  UPDATE [${db}].dbo.Настилы set [DataE]=cast(getdate() as smalldatetime),[Closed]=1 where idRask=${idРаскроя} `.replace(
    /\n/gi,
    " "
  );
};

const restInRoll = (rollId) => {
  return `
  declare @consumed int= (SELECT sum(Enddat-startdat) from [Technology].dbo.НастилРулоны where idrulon='${rollId}' and EndDat is not null and EndDat>0)
  Select case when @consumed is null then quan else quan-@consumed end as rest from Logistic.dbo.MaterialStorage where idRul='${rollId}'
  ;`.replace(/\n/gi, " ");
};

const getCutouts = (spreadID) => {
  return `SELECT * FROM (SELECT 'Остаток вычитается' as operation, описание as type, idRul as rollID, cast(дата as smalldatetime) as date, Длинна as length
  FROM [Technology].[dbo].[НастилОстатки] where idNastila=${spreadID}
  UNION ALL
  SELECT 'Остаток добавлен' as operation,'Концевой остаток' as type,idRul as rollID,cast(дата as smalldatetime) as date, Длинна as length
  FROM [Technology].[dbo].[НастилОстаткиДобавлено] where idNastila=${spreadID}
  UNION ALL
  SELECT 'Остаток вычитается' as operation, 'Концевой остаток' as type, '' as rollID,cast(dat as smalldatetime) as date,[kol-vo] as length 
  FROM [Technology].[dbo].[KonOstatki] where descript like 'Концевой с настила ${spreadID}%') 
  as a ORDER by date;`.replace(/\n/gi, " ");
};

const getCutoutLabels = (spreadID, material) => {
  return `SELECT [id] as cutoutBarcode,[NLear] as nLear,[idRul] as idRul,[Длинна] as length,[описание] as type, cast([дата] as smalldatetime) as date, '${material}' as material
  FROM [Technology].[dbo].[НастилОстатки] 
  where распечатан=0 or распечатан is null and idNastila=${spreadID};`.replace(
    /\n/gi,
    " "
  );
};
const setCutoutPrint = (id) => {
  return `UPDATE [Technology].[dbo].[НастилОстатки] SET [распечатан]=1 where id=${id};`;
};

const getOrderData = (table, date) => {
  return `SELECT [id],[Раскладка],[Материал],[Длинна] as ВсегоМат,[НомерЛИР] as НомерЛир,[смена] as Cмена,[Позиция]
  FROM [Technology].[dbo].[Раскрой] where ДатаПлан='${date}' and стол='${table}' and ДатаРаскороя is null and (MaterialOrdered is null or MaterialOrdered=0)
  order by смена, [Позиция];`.replace(/\n/gi, " ");
};

const orderMaterial = (props) => {
  return `
  DECLARE @json NVARCHAR(max);
  SET @json=N'${JSON.stringify(props)}';  
  UPDATE [Technology].[dbo].[Раскрой] SET [MaterialOrdered]=1    
  FROM (SELECT IdRask FROM OPENJSON(@json) WITH (IdRask int '$.IdRask')) as a    WHERE id=a.IdRask;   
  INSERT INTO [Logistic].[dbo].[CanBanMat] ([IdRask],[idKomp],Материал, НомерЛИР, Длинна)  
  SELECT JsonData.* FROM OPENJSON(@json, N'$')    
  WITH (IdRask int '$.IdRask',
        idKomp nvarchar(20) '$.idKomp',
		    Материал nvarchar(50) '$.Material', 
		    НомерЛИР nvarchar(20) '$.LearPN',
		    Длинна float '$.Leng'
) as JsonData;
UPDATE [Logistic].[dbo].[CanBanMat] SET DataS=cast(getdate() as smalldatetime),Prin=0,Closed=0 where Prin is null;`.replace(
    /\n/gi,
    " "
  );
};
const orderConsumable = (table, material) => {
  return `insert into [Logistic].[dbo].[CanBanMat] (IdRask,idKomp,Материал,НомерЛИР,Длинна,DataS,DataE,Prin,Closed)
  values (0,'${table}','${material}','',0,cast(getdate() as smalldatetime),NULL,0,0)`.replace(
    /\n/gi,
    " "
  );
};
const cancelSpread = (id) => {
  return `DELETE FROM [Technology].[dbo].[Настилы] WHERE id=${id};
  DELETE FROM [Technology].[dbo].[НастилРулоны] where idnastil=${id};
  DELETE FROM [Technology].[dbo].[НастилОстаткиДобавлено] where idNastila=${id};
  DELETE FROM [Technology].[dbo].[НастилОстатки] where idNastila=${id};
  `.replace(/\n/gi, " ");
};

const setLastMeasure = (rollID, spreadID, measure) => {
  return `UPDATE [Technology].[dbo].[НастилРулоны] SET [EndDat]=${measure} WHERE [idrulon]='${rollID} and [idnastil]=${spreadID}'; `;
};

module.exports = {
  setLastMeasure,
  getLastSpreadingID,
  createSpread,
  getMarkers,
  getLengths,
  getMarkerData,
  getRollData,
  getMinPart,
  getMaterialData,
  checkCutoutLength,
  createCutout,
  createLeftOver,
  findCutout,
  addCutout,
  getRollID,
  checkOpenedSpreads,
  setLabelPrint,
  addRolltoSpread,
  lastMeasure,
  closeRoll,
  closeMarkers,
  restInRoll,
  getCutouts,
  getCutoutLabels,
  setCutoutPrint,
  getOrderData,
  orderMaterial,
  orderConsumable,
  cancelSpread,
};
