-------------------------------------------------------------------------------
--- List Employee's Documents
--  description:  Collates both legacy documents uploaded and associated 
--                with the employee and documents e-signed by the employee					
-------------------------------------------------------------------------------

declare @_employeeId int = @employeeId
declare @tmp table
(
  ID  bigint,
	Title nvarchar(max),
	Category nvarchar(max),
	UploadDate datetime2(3),
	Extension nvarchar(max),
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
		ID = @_employeeId
),
LegacyDocuments as
(
	select 
		 d.ID,
		 Title = iif(d.Title is NULL, d.Filename, d.Title), 
		 Category = d.DocumentCategory, 
		 d.UploadDate,
		 d.Extension
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
	except
		select 
		 d.ID,
		 Title = iif(d.Title is NULL, d.Filename, d.Title), 
		 Category = d.DocumentCategory, 
		 d.UploadDate,
		 d.Extension
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
	where
		d.IsPrivateDocument = 1
),
SignedDocuments as 
(
	select
	  d.ID,
	  d.Title, 
	  d.Category, 
	  d.UploadDate
	from
		dbo.FileMetadata d
		inner join EmployeeInfo e on 
			d.CompanyID = e.CompanyID
			and d.EmployeeCode = e.EmployeeCode

),

CollatedDocuments as
(
	select ID, Title, Category, UploadDate, Extension, IsLegacyDocument = 1 from LegacyDocuments
	union 
	select ID, Title, Category, UploadDate, '.pdf', IsLegacyDocument = 0 from SignedDocuments
)

insert into @tmp
select * from CollatedDocuments

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






	
	



