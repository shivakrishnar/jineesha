select
	evtType.Name, evt.FileName
from
	dbo.DataImportEvent evt inner join
		dbo.DataImportType evtType on evt.DataImportTypeID = evtType.ID
where
	evt.ID = @ID