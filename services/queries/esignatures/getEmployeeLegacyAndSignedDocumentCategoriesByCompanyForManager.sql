
-------------------------------------------------------------------------------
--- List All Employees' Document Categories for a Manager
--  description:  Collates both legacy document categories and e-signed 
--                document categories associated with the employee				
-------------------------------------------------------------------------------


declare @_managerEmail varchar(max) = '@manager'
declare @_companyId int = @companyId
declare @tmp table
(
	CompanyID int, 
	Category nvarchar(max)
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
		 CompanyID = case
						when d.CompanyID is NULL then c.ID
						else d.CompanyID
					end,
		 Category = d.DocumentCategory
	from
		dbo.Document d
		inner join ManagedEmployees e on d.EmployeeID = e.ID
		inner join dbo.Company c on c.ID = e.CompanyID
	    
),
LegacyDocumentPublishedToEmployee as
(
 	select distinct
		 CompanyID = case
						when d.CompanyID is NULL then c.ID
						else d.CompanyID
					end,
		 Category = d.DocumentCategory
	from
		dbo.Document d
		inner join ManagedEmployees e on d.CompanyID = e.CompanyID
		inner join dbo.Company c on c.ID = e.CompanyID
	where
		d.IsPublishedToManager = 1
),

SignedDocuments as 
(
	select distinct
	  d.CompanyID,
	  d.Category
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
	select distinct
		  e.CompanyID,
		  d.Category
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
            and d.EmployeeCode = e.EmployeeCode
	    inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1

    union

    select distinct
		  e.CompanyID,
		  d.Category
	from
		dbo.FileMetadata d
		inner join ManagedEmployees e on 
			d.CompanyID = e.CompanyID
	    inner join dbo.Company c on
			c.ID = e.CompanyID
	where
		d.IsPublishedToEmployee = 1 
        and d.EmployeeCode is null
),

CollatedDocuments as
(
	select CompanyID, Category from LegacyDocumentPublishedToEmployee
	union
	select CompanyID, Category from LegacyDocuments
	union 
	select CompanyID, Category from SignedDocuments
    union
	select CompanyID, Category from NewDocumentPublishedToEmployee

)

insert into @tmp
select * 
from 
	CollatedDocuments
	
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