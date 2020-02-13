-------------------------------------------------------------------------------
--- List All Employees' Document Categories By Company
--  description:  Collates both legacy document categories and e-signed 
--                document categories associated with the employee				
-------------------------------------------------------------------------------

declare @_companyId int = @companyId
declare @tmp table
(
	Category nvarchar(max)
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
		Category = d.DocumentCategory
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID 
		inner join dbo.Company c on c.ID = e.CompanyID
),

LegacyDocumentPublishedToEmployee as
(
 	select distinct
		Category = d.DocumentCategory
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
	  f.Category
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
	  f.Category
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
		  d.Category
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
	select Category from LegacyDocumentPublishedToEmployee
	union
	select Category from LegacyDocuments
	union 
	select Category from SignedDocuments
    union
	select Category from NewDocumentPublishedToEmployee
)

insert into @tmp
select * from CollatedDocuments

-- pagination count
select totalCount = count(*) from @tmp

select distinct
	Category
from 
	@tmp
where
	trim('    ' from Category) is not null and Category <> ''
order by
	Category