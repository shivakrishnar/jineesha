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
	Category nvarchar(max),
	UploadDate datetime2(3),
	Extension nvarchar(max),
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
		d.UploadDate,
		d.Extension

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
	select ID, CompanyID, Title, Category, UploadDate, Extension, IsLegacyDocument = 1 from LegacyDocuments
	union 
	select ID, CompanyID, Title, Category, UploadDate, '.pdf', IsLegacyDocument = 0 from SignedDocuments
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
	extension = Extension,
	category = Category, 
	uploadDate = UploadDate,
	isLegacyDocument = IsLegacyDocument
from 
	@tmp
order by uploadDate desc