-------------------------------------------------------------------------------
--- List All Employees' Documents By Company
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee				
-------------------------------------------------------------------------------

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
    EsignDate datetime2(3),
	IsLegacyDocument bit,
	IsPublishedToEmployee bit,
	IsPrivateDocument bit,
    EmployeeCode nvarchar(max),
	EmployeeID int,
	FirstName nvarchar(max),
	LastName nvarchar(max),
	UploadedBy nvarchar(max)
)

;with EmployeeInfo as 
(
	select 
		ID,
		EmployeeCode,
		CompanyID,
		FirstName,
		LastName
	from
		dbo.Employee
	where
		CompanyID =  @_companyId
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
        EsignDate = d.ESignDate,
		d.IsPublishedToEmployee,
		d.IsPrivateDocument,
		EmployeeCode = null,
		EmployeeID = d.EmployeeID,
		e.FirstName,
		e.LastName,
		UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID 
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
        EsignDate = d.ESignDate,
		d.IsPublishedToEmployee,
		d.IsPrivateDocument,
		EmployeeCode = null,
		EmployeeID = null,
		FirstName = null,
		LastName = null,
		UploadedBy = d.UploadbyUsername
	from
		dbo.Document d
		inner join EmployeeInfo e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),

SignedDocuments as 
(
	select
	  ID = f.ID,
	  f.CompanyID,
	  c.CompanyName,
	  f.Title, 
	  Filename = right(f.Pointer, charindex('/', reverse(f.Pointer) + '/') - 1),
	  f.Category, 
	  f.UploadDate,
      EsignDate = null,
	  f.IsPublishedToEmployee,
	  IsPrivateDocument = null,
	  f.EmployeeCode,
	  EmployeeID = e.ID,
	  e.FirstName,
	  e.LastName,
	  f.UploadedBy
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
    where
		f.IsPublishedToEmployee <> 1 or f.IsPublishedToEmployee is null	
    union
    select
	  ID = f.ID,
	  f.CompanyID,
	  c.CompanyName,
	  f.Title, 
	  Filename = right(f.Pointer, charindex('/', reverse(f.Pointer) + '/') - 1),
	  f.Category, 
	  f.UploadDate,
      EsignDate = null,
	  f.IsPublishedToEmployee,
	  IsPrivateDocument = null,
	  f.EmployeeCode,
	  EmployeeID = e.ID,
	  e.FirstName,
	  e.LastName,
	  f.UploadedBy
	from
		dbo.FileMetadata f
        inner join EmployeeInfo e on 
            f.CompanyID = e.CompanyID 
            and f.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
    where
		f.IsPublishedToEmployee = 1
),

NewDocumentPublishedToEmployee as 
(
	select
		  ID = d.ID,
		  d.CompanyID,
		  c.CompanyName,
		  d.Title, 
		  Filename = right(d.Pointer, charindex('/', reverse(d.Pointer) + '/') - 1),
		  d.Category, 
		  d.UploadDate,
          EsignDate = null,
		  d.IsPublishedToEmployee,
		  IsPrivateDocument = null,
		  d.EmployeeCode,
		  EmployeeID = null,
		  FirstName = null,
		  LastName = null,
		  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1 and
        d.EmployeeCode is null
),

CollatedDocuments as
(
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from LegacyDocumentPublishedToEmployee
	union
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 1, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from LegacyDocuments
	union 
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from SignedDocuments
    union
	select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from NewDocumentPublishedToEmployee
)

insert into @tmp
select * from CollatedDocuments

-- pagination count
select totalCount = count(*) from @tmp

select 
	id = ID, 
	title = Title, 
	fileName = Filename,
	category = Category, 
	uploadDate = UploadDate,
    esignDate = EsignDate, 
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
