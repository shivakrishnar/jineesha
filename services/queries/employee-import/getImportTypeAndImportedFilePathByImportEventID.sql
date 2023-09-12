select
	evt.FileName, evtType.CSVHeader
from
	dbo.DataImportEvent evt inner join
		dbo.DataImportType evtType on evt.DataImportTypeID = evtType.ID
where
	evt.ID = @ID