-------------------------------------------------------------------------------
--- List Employee's Document Categories
--  description:  Collates both legacy document categories and e-signed 
--                document categories associated with the employee				
-------------------------------------------------------------------------------

declare @_employeeId int = @employeeId
declare @_includePrivateDocuments bit = @includePrivateDocuments
declare @_invokerUsername varchar(max) = @invokerUsername
declare @tmp table
(
	Category nvarchar(max)
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
		Category = d.DocumentCategory
	from
		dbo.Document d
		inner join EmployeeInfo e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	except
		select 
			Category = d.DocumentCategory
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
 	select distinct
		 Category = d.DocumentCategory
	from
		dbo.Document d
		inner join EmployeeInfo e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1
),
UploadedPrivateDocuments as 
(
	select distinct
	  d.Category
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
	select distinct
	  d.Category
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
	select distinct
		  d.Category
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
    select Category from LegacyDocumentPublishedToEmployee
    union
	select Category from LegacyDocuments
	union 
	select Category from SignedDocuments
	union
	select Category from NewDocumentPublishedToEmployee
    union 
    select Category from UploadedPrivateDocuments
)

insert into @tmp
select * from CollatedDocuments
	
-- pagination count
select totalCount = count(*) from @tmp

select 
	Category
from 
	@tmp
where
	trim('    ' from Category) is not null and Category <> ''
order by
	Category