declare @DataImportEventID bigint = 0

insert into dbo.DataImportEvent(
	CompanyID, 
	DataImportTypeID,
	LastUserID,
	Status,
	CreationDate
) values (
	@CompanyID,
	@DataImportTypeID,
	@UserID,
	'Ready',
	GETDATE()
)
select @DataImportEventID = SCOPE_IDENTITY()
