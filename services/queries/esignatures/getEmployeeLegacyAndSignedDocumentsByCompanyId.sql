-------------------------------------------------------------------------------
--- List All Employees' Documents By Company
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee				
-------------------------------------------------------------------------------

declare @_companyId int = @companyId
declare @tmp table
(
    ID  bigint,
	Title nvarchar(max),
	Category nvarchar(max),
	UploadDate datetime2(3),
	IsLegacyDocument bit
)

;with EmployeeInfo as 
(
	select 
		ID,
		EmployeeCode,
		CompanyID
	from
		dbo.Employee
	where
		CompanyID =  @_companyId
),

LegacyDocuments as
(
	select 
		 d.ID,
		 Title = iif(d.Title is null, d.Filename, d.Title), 
		 Category = d.DocumentCategory, 
		 d.UploadDate
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID 
	    
),
SignedDocuments as 
(
	select
	  ID,
	  Title, 
	  Category, 
	  UploadDate
	from
		dbo.FileMetadata
	where
		CompanyID = @_companyId
		
),

CollatedDocuments as
(
	select ID, Title, Category, UploadDate, IsLegacyDocument = 1 from LegacyDocuments
	union 
	select ID, Title, Category, UploadDate, IsLegacyDocument = 0 from SignedDocuments
)

insert into @tmp
select * from CollatedDocuments

-- pagination count
select totalCount = count(*) from @tmp

select 
	id = ID, 
	title = Title, 
	category = Category, 
	uploadDate = UploadDate, 
	isLegacyDocument = IsLegacyDocument
from 
	@tmp