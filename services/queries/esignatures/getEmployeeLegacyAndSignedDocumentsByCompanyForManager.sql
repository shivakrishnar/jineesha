
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
	CompanyName nvarchar(max),
	Title nvarchar(max),
	Filename nvarchar(max),
	Category nvarchar(max),
	UploadDate datetime2(3),
	IsLegacyDocument bit,
	IsPublishedToEmployee bit,
	IsPrivateDocument bit,
    EmployeeCode nvarchar(max),
	EmployeeID int,
    FirstName nvarchar(max),
    LastName nvarchar(max),
	UploadedBy nvarchar(max)
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
		ee.CompanyID,
        ee.FirstName,
        ee.LastName
	from
		dbo.Employee ee,
		Manager m
	where 
		m.ID in (ee.CurrentSupervisor1ID, ee.CurrentSupervisor2ID, ee.CurrentSupervisor3ID)
),

LegacyDocuments as
(
	select 
		 ID = d.ID,
		 d.CompanyID,
		 c.CompanyName,
		 Title = iif(d.Title is null, d.Filename, d.Title), 
		 d.Filename,
		 Category = d.DocumentCategory, 
		 d.UploadDate,
		 d.IsPublishedToEmployee,
		 d.IsPrivateDocument,
		 EmployeeCode = null,
		 EmployeeID = e.ID,
         e.FirstName,
         e.LastName,
		 UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join ManagedEmployees e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	    
),
LegacyDocumentPublishedToEmployee as
(
 	select 
		 ID = d.ID,
		 d.CompanyID,
		 c.CompanyName,
		 Title = iif(d.Title is NULL, d.Filename, d.Title),
		 d.Filename,
		 Category = d.DocumentCategory, 
		 d.UploadDate,
		 d.IsPublishedToEmployee,
		 d.IsPrivateDocument,
		 EmployeeCode = null,
		 EmployeeID = null,
         FirstName = null,
         LastName = null,
		 UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join ManagedEmployees e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d. IsPublishedToEmployee = 1
),

SignedDocuments as 
(
	select
	  ID = d.ID,
	  d.CompanyID,
	  c.CompanyName,
	  d.Title, 
	  Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
	  d.Category, 
	  d.UploadDate,
	  d.IsPublishedToEmployee,
	  IsPrivateDocument = null,
	  d.EmployeeCode,
	  EmployeeID = e.ID,
      e.FirstName,
      e.LastName,
	  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
    where
		d.IsPublishedToEmployee <> 1 or d.IsPublishedToEmployee is null
),

NewDocumentPublishedToEmployee as 
(
	select
		  ID = d.ID,
		  e.CompanyID,
		  c.CompanyName,
		  d.Title, 
		  Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
		  d.Category, 
		  d.UploadDate,
		  d.IsPublishedToEmployee,
		  IsPrivateDocument = null,
		  EmployeeCode = null,
		  EmployeeID = null,
          FirstName = null,
          LastName = null,
		  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
	    inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),

CollatedDocuments as
(
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, IsLegacyDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from LegacyDocumentPublishedToEmployee
	union
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, IsLegacyDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from LegacyDocuments
	union 
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, IsLegacyDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from SignedDocuments
    union
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, IsLegacyDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from NewDocumentPublishedToEmployee

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
	isLegacyDocument = IsLegacyDocument,
	isPublishedToEmployee = IsPublishedToEmployee,
	isPrivateDocument = IsPrivateDocument,
	employeeCode = EmployeeCode,
	companyId = CompanyID,
	employeeId = EmployeeID,
    companyName = CompanyName,
    firstName = FirstName,
    lastName = LastName,
	uploadedBy = UploadedBy
from 
	@tmp
order by uploadDate desc