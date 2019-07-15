-------------------------------------------------------------------------------
--- List All Employees' Documents 
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee				
-------------------------------------------------------------------------------

declare @_user nvarchar(max) = '@user'

declare @tmp table
(
    ID  bigint,
	CompanyID int, 
	Title nvarchar(max),
	Filename nvarchar(max),
	Category nvarchar(max),
	UploadDate datetime2(3),
	IsLegacyDocument bit
)

;with LegacyDocuments as
(
	select 
		d.ID,
		CompanyID = c.ID,
		c.CompanyName,
		e.LastName, 
		e.FirstName,
		d.Filename,
		Title = iif(d.Title is NULL, d.Filename, d.Title), 
		Category = d.DocumentCategory, 
		d.UploadDate
	from
		dbo.Document d
		inner join dbo.Employee e on d.EmployeeID = e.ID
		inner join dbo.Company c on e.CompanyID = c.ID
		inner join dbo.StatusType st on e.CurrentStatusTypeID = st.ID
	where
		st.IndicatesActiveEmployee in (0, 1)
	    
),
SignedDocuments as 
(
	select
	  ID,
	  CompanyID,
	  Title, 
	  Filename = right(Pointer, charindex('/', reverse(Pointer) + '/') - 1),
	  Category, 
	  UploadDate
	from
		dbo.FileMetadata
),
ExcludedCompanies as
(
	select
		ID = CompanyID
	from 
		dbo.HRnextUserCompanyExclude ec
		inner join dbo.HRnextUser u on ec.HRnextUserID = u.ID 
	where
		u.Username = @_user
),
CollatedDocuments as
(
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 1 from LegacyDocuments
	union 
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 0 from SignedDocuments
)

insert into @tmp
select * 
from 
	CollatedDocuments
where
	CompanyID not in (select ID from ExcludedCompanies)

-- pagination count
select totalCount = count(*) from @tmp

select 
	id = ID, 
	title = Title, 
	fileName = Filename,
	category = Category, 
	uploadDate = UploadDate,
	isLegacyDocument = IsLegacyDocument
from 
	@tmp
order by uploadDate desc