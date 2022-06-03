const cutters = [
  null,
  "'Bullmer1'",
  "'Diamond2'",
  "'Bullmer3'",
  "'Bullmer4'",
  "'5'",
  "'6'",
];
const db = "Technology";

const update1 = (id, table, date, shift) => {
  let args = [...arguments];
  if (!args.includes("undefined") && !args.includes("NaN")) {
    const q = `Declare @t int; set @t= case when (select max(Позиция)+1 from ${db}.dbo.Раскрой where Стол=${cutters[table]} and ДатаПлан='${date}' and смена=${shift}) is null then 1 else (select max(Позиция)+1 from ${db}.dbo.Раскрой where Стол=${cutters[table]} and ДатаПлан='${date}' and смена=${shift}) end; Update ${db}.dbo.Раскрой set Стол=${cutters[table]}, смена =${shift}, Позиция=@t  where ID=${id}; `;
    return q;
  } else {
    throw new Error("Wrong arguments!");
  }
};

const update2 = (id, table, shift) => {
  let args = [...arguments];
  if (!args.includes("undefined") && !args.includes("NaN")) {
    const q = `Declare @q int;Declare @t nvarchar(20);  set @q= (select Позиция from ${db}.dbo.Раскрой where ID='${table}'); set @t= (select Стол from ${db}.dbo.Раскрой where ID='${table}');Update ${db}.dbo.Раскрой set Позиция=Позиция+1 where Стол=@t and Позиция>=@q;Update ${db}.dbo.Раскрой set Стол=@t, Позиция=@q,смена=${shift} where ID=${id}`;
    return q;
  } else {
    throw new Error("Wrong arguments!");
  }
};

const update3 = (id, date, layers, shift, table) => {
  let args = [...arguments];
  if (!args.includes("undefined") && !args.includes("NaN")) {
    const q = `Update ${db}.dbo.Раскрой set КолСлоев=${layers}, ДатаПлан='${date}',смена=${shift},Стол=${cutters[table]} where id=${id};`;
    return q;
  } else {
    throw new Error("Wrong arguments!");
  }
};

const onDragUpdate = (id) => {
  let args = [...arguments];
  if (!args.includes("undefined") && !args.includes("NaN")) {
    const q = `Update ${db}.dbo.Раскрой set Позиция=0 where ID=${id}`;
    return q;
  } else {
    throw new Error("Wrong arguments!");
  }
};

const selectQuery = (plandate, shift) => {
  let args = [...arguments];
  if (!args.includes("undefined") && !args.includes("NaN")) {
    //const q = `select a.ID, case when Позиция is null then 0 else Позиция end as markerQueue, a.Раскладка as Marker, case Стол when 'Bullmer1' then 1 when 'Diamond2' then 2 when 'Bullmer3' then 3 when 'Bullmer4' then 4 else case when Стол is null then 0 else Стол end end as ctTbl, case when смена is null then 0 else смена end as shift, КолСлоев as Layers, a.Материал as LearNumber, модель as Model, комплект as Carset, round(Станд_время,2) as stdtime, раскроен  from ${db}.dbo.Раскрой as a left join [${db}].[dbo].[Раскладки] as b on a.idРаскладки=b.id where ДатаПлан='${plandate}' and (смена=${shift} or смена=0 or смена is null) order by Позиция`;

    const q = `select * from ( SELECT a.ID, a.Раскладка as Marker, КолСлоев as Layers, [ДатаПлан], модель as Model,  комплект as Carset, [раскроен], a.Материал as LearNumber, case when смена is null then 0 else смена end as shift, case when Позиция is null then 0 else Позиция end as markerQueue, round(Станд_время,2) as stdtime, case Стол when 'Bullmer1' then 1 when 'Diamond2' then 2 when 'Bullmer3' then 3 when 'Bullmer4' then 4 else case when Стол is null then 0 else Стол end end as ctTbl, round(Длинна,1) as Длинна FROM [${db}].[dbo].[Раскрой] as a left join ${db}.dbo.Раскладки as b on a.idРаскладки=b.id where nakt is null and ДатаПлан='${plandate}' and (смена=${shift} or смена=0 or смена is null) union all SELECT c.[ID], c.Раскладка as Marker,КолСлоев as Layers, [ДатаПлан],модель as Model,комплект as Carset, [раскроен],c.Материал as LearNumber, case when смена is null then 0 else смена end as shift, case when Позиция is null then 0 else Позиция end as markerQueue,round(время,2) as stdtime,case Стол when 'Bullmer1' then 1 when 'Diamond2' then 2 when 'Bullmer3' then 3 when 'Bullmer4' then 4 else case when Стол is null then 0 else Стол end end as ctTbl, round(Длинна,1) as Длинна FROM [${db}].[dbo].[Раскрой] as c  join [${db}].[dbo].[СлужЗапискиРаскладки] as d on c.Раскладка=d.Раскладка+'.' and c.NAKT=d.nakt where ДатаПлан='${plandate}' and (смена=${shift} or смена=0 or смена is null)) as g order by markerQueue; `;
    return q;
  } else {
    throw new Error("Wrong arguments!");
  }
};

// const update4 = () => {
//   const q = `Declare @t int;`;
//   return q;
// };

// const update5 = (id, table, date, shift) => {
//   let args = [...arguments];
//   if (!args.includes("undefined") && !args.includes("NaN")) {
//     const q = `set @t= case when (select max(Позиция)+1 from ${db}.dbo.Раскрой where Стол=${cutters[table]} and ДатаПлан='${date}' and смена=${shift}) is null then 1 else (select max(Позиция)+1 from ${db}.dbo.Раскрой where Стол=${cutters[table]} and ДатаПлан='${date}' and смена=${shift}) end; Update ${db}.dbo.Раскрой set Стол=${cutters[table]}, смена =${shift}, Позиция=@t  where ID=${id};`;
//     return q;
//   } else {
//     throw new Error("Wrong arguments!");
//   }
// };

// const update6 = (id, table, shift) => {
//   let args = [...arguments];
//   if (!args.includes("undefined") && !args.includes("NaN")) {
//     const q = `set @q= (select Позиция from ${db}.dbo.Раскрой where ID='${table}'); set @t= (select Стол from ${db}.dbo.Раскрой where ID='${table}');Update ${db}.dbo.Раскрой set Позиция=Позиция+1 where Стол=@t and Позиция>=@q;Update ${db}.dbo.Раскрой set Стол=@t, Позиция=@q,смена=${shift} where ID=${id}`;
//     return q;
//   } else {
//     throw new Error("Wrong arguments!");
//   }
// };

const update7 = () => {
  const q = `Declare @q int;Declare @t nvarchar(20); `;
  return q;
};

const update8 = (jsonData) => {
  const q = `declare @json NVARCHAR(max); set @json='${jsonData}'; update ${db}.dbo.Раскрой set стол=tbl, Позиция=queue, смена=shift from (select * from OPENJSON(@json) with ( markerId int '$.markerId', tbl nvarchar(20) '$.tbl',queue int '$.queue',shift int '$.shift')) as a where id=a.markerid;`;
  return q;
};

const update9 = ({ position, positionShift, tbl, shift, date, collection }) => {
  const q = `declare @json NVARCHAR(max); set @json='${JSON.stringify(
    collection
  )}';Update ${db}.dbo.Раскрой set позиция=позиция+${positionShift} where Стол=${
    cutters[tbl]
  } and датаплан='${date}' and смена=${shift} and позиция>=${position};Update ${db}.dbo.Раскрой set позиция=queue, Стол=${
    cutters[tbl]
  }, смена=${shift} from (select * from OPENJSON(@json) with ( markerId int '$.markerId', queue int '$.queue')) as a where id=a.markerID;`;
  return q;
};

const select1 = (id) => {
  const q = `select позиция as position from ${db}.dbo.Раскрой where id=${id}`;
  return q;
};

const materialPrintQuery = (date) => {
  const q = `select материал, номерлир, round(sum(Длинна),1) as потребность,смена, стол from ${db}.dbo.раскрой where датаплан='${date}' and раскроен is null and стол is not null and стол<>'0' and смена<>4 group by материал, номерлир,смена, стол order by смена,стол;`;
  return q;
};

module.exports = {
  update1,
  update2,
  update3,
  update7,
  update8,
  update9,
  select1,
  onDragUpdate,
  selectQuery,
  materialPrintQuery,
};
