declare @DataImportEventID bigint = 0

insert into dbo.DataImportEvent(
	CompanyID, 
	DataImportTypeID,
	LastUserID,
	Status,
	CreationDate,
	Active,
	Filename
) values (
	@CompanyID,
	@DataImportTypeID,
	@UserID,
	'Ready',
	GETDATE(),
	1,
	@FileName
)
select @DataImportEventID = SCOPE_IDENTITY()
