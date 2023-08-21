declare @_dataImportEventId as int = @dataImportEventId

select CSVRowStatus, count(*) as total
from dataimporteventdetail 
where DataImportEventID = @_dataImportEventId 
group by CSVRowStatus
order by CSVRowStatus