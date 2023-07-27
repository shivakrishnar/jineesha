insert into dbo.DataImportEventDetail(
	DataImportEventID,	
	CSVRowNumber,
	CSVRowData,
	CSVRowStatus,
	LastProgramEvent,
	CreationDate
) values (
	@DataImportEventID,	
	@CSVRowNumber,
	'@CSVRowData',
	'Ready',
	'Manual',
	GETDATE()
)
