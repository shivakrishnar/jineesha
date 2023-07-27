declare @DataImportEventID bigint = 0

insert into dbo.DataImportEvent(
	CompanyID, 
	DataImportTypeID, 
	Status, 
	CreationDate
) values (
	@CompanyID,
	@DataImportTypeID,
	'Ready',
	GETDATE()
)
select @DataImportEventID = SCOPE_IDENTITY()
