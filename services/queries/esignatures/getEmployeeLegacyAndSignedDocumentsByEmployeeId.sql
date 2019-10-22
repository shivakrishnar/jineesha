-------------------------------------------------------------------------------
--- List Employee's Documents
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee					
-------------------------------------------------------------------------------

declare @_employeeId int = @employeeId
declare @_includePrivateDocuments bit = @includePrivateDocuments
declare @_invokerUsername varchar(max) = @invokerUsername
declare @_search as nvarchar(max) = '%' + @search + '%';
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

-- Restriction to prevent users with administrative privileges from viewing their own Private documentation
select 
    @_includePrivateDocuments = @_includePrivateDocuments & iif(ue.EmployeeID = @_employeeId, 0, 1)
from 
    dbo.HRnextUser hru
    inner join dbo.HRnextUserEmployee ue on hru.ID = ue.HRnextUserID
where 
    Username = @_invokerUsername
    and ue.EmployeeID = @_employeeId

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
		ID = @_employeeId
),
LegacyDocuments as
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
		 EmployeeID = d.EmployeeID,
		 e.FirstName,
		 e.LastName,
		 UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	except
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
		 EmployeeID = d.EmployeeID,
		 e.FirstName,
		 e.LastName,
		 UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPrivateDocument = 1
		and @_includePrivateDocuments <> 1
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
		 UploadedBy = d.UploadByUsername
	from
		dbo.Document d
		inner join EmployeeInfo e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),
UploadedPrivateDocuments as 
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
	  EmployeeID = e.ID,
	  e.FirstName,
	  e.LastName,
	  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 0
        and @_includePrivateDocuments <> 0
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
      EsignDate = null,
      d.IsPublishedToEmployee,
	  IsPrivateDocument = null,
	  d.EmployeeCode,
	  EmployeeID = e.ID,
	  e.FirstName,
	  e.LastName,
	  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee <> 0 or d.IsPublishedToEmployee is null
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
		  e.FirstName,
		  e.LastName,
		  d.UploadedBy
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
		inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1 and d.EmployeeCode is null
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
    union 
    select ID, CompanyID, CompanyName, Title, Filename, Category, UploadDate, EsignDate, IsLegacyDocument = 0, IsPublishedToEmployee, IsPrivateDocument, EmployeeCode, EmployeeID, FirstName, LastName, UploadedBy from UploadedPrivateDocuments
)

insert into @tmp
select * from CollatedDocuments
where lower(Category) like @_search or lower(Title) like @_search
-- pagination count
select totalCount = count(*) from @tmp

select 
	id = ID, 
	companyId = CompanyID,
	title = Title, 
	fileName = Filename,
	category = Category, 
	uploadDate = UploadDate,
    esignDate = EsignDate, 
	isLegacyDocument = IsLegacyDocument,
	isPublishedToEmployee = IsPublishedToEmployee,
	isPrivateDocument = IsPrivateDocument,
	employeeCode = EmployeeCode,
	employeeId = EmployeeID,
	companyName = CompanyName,
	firstName = FirstName,
	lastName = LastName,
	uploadedBy = UploadedBy
from 
	@tmp
order by uploadDate desc

