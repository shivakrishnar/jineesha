-------------------------------------------------------------------------------
--- List All Employees' Document Categories
--  description:  Collates both legacy document categories and e-signed
--                document categories associated with the employee
-------------------------------------------------------------------------------

declare @_user nvarchar(max) = '@user'

declare @tmp table
(
    CompanyID int,
    Category nvarchar(max)
)

;with LegacyDocuments as
(
    select 
        CompanyID = c.ID,
        Category = d.DocumentCategory
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
        d.CompanyID,
        d.Category
    from
        dbo.FileMetadata d
        inner join dbo.Employee e on
            e.EmployeeCode = d.EmployeeCode and
            e.CompanyID = d.CompanyID
        inner join dbo.Company c on
            c.ID = d.CompanyID
    union
    select
        f.CompanyID,
        f.Category
    from
        dbo.FileMetadata f
        inner join dbo.Company c on
            c.ID = f.CompanyID
    where
        f.EmployeeCode is null
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
    select
        CompanyID,
        Category
    from
        LegacyDocuments
    union 
    select
        CompanyID,
        Category
    from
        SignedDocuments
)

insert into @tmp
select * 
from 
    CollatedDocuments
where
    CompanyID not in (select ID from ExcludedCompanies) 

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