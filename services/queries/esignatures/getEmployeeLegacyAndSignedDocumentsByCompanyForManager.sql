
-------------------------------------------------------------------------------
--- List All Employees' Documents for a Manager
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee				
-------------------------------------------------------------------------------


declare @_managerEmail varchar(max) = '@manager'
declare @_companyId int = @companyId
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

;with Manager as 
(
  select
     ee.ID
  from 
    dbo.Employee ee
    inner join dbo.HRnextUserEmployee ue on ue.EmployeeID = ee.ID 
    inner join dbo.HRnextUser hru on hru.ID = ue.HRnextUserID
  where
      hru.Username = @_managerEmail
),
ManagedEmployees as 
(
	select 
		ee.ID,
		ee.EmployeeCode,
		ee.CompanyID
	from
		dbo.Employee ee,
		Manager m
	where 
		m.ID in (ee.CurrentSupervisor1ID, ee.CurrentSupervisor2ID, ee.CurrentSupervisor3ID)
),

LegacyDocuments as
(
	select 
		 d.ID,
		 d.CompanyID,
		 Title = iif(d.Title is null, d.Filename, d.Title), 
		 d.Filename,
		 Category = d.DocumentCategory, 
		 d.UploadDate
	from
		dbo.Document d
		inner join ManagedEmployees e on d.EmployeeID = e.ID 
	    
),
LegacyDocumentPublishedToEmployee as
(
 	select 
		 d.ID,
		 d.CompanyID,
		 Title = iif(d.Title is NULL, d.Filename, d.Title),
		 d.Filename,
		 Category = d.DocumentCategory, 
		 d.UploadDate
	from
		dbo.Document d
		inner join ManagedEmployees e on d.CompanyID = e.CompanyID
	where
		d. IsPublishedToEmployee = 1
),

SignedDocuments as 
(
	select
	  d.ID,
	  d.CompanyID,
	  d.Title, 
	  Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
	  d.Category, 
	  d.UploadDate
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
    where
		d.IsPublishedToEmployee <> 1 or d.IsPublishedToEmployee is null
		
),

NewDocumentPublishedToEmployee as 
(
	select
		  d.ID,
		  e.CompanyID,
		  d.Title, 
		  Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
		  d.Category, 
		  d.UploadDate
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
	where
	d.IsPublishedToEmployee = 1
),

CollatedDocuments as
(
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 1 from LegacyDocumentPublishedToEmployee
	union
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 1 from LegacyDocuments
	union 
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 0 from SignedDocuments
    union
	select ID, CompanyID, Title, Filename, Category, UploadDate, IsLegacyDocument = 0 from NewDocumentPublishedToEmployee

)

insert into @tmp
select * 
from 
	CollatedDocuments

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