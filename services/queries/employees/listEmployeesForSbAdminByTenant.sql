declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @employeeList table (
    ID int,
    CompanyID int,
    FirstName nvarchar(max),
    LastName nvarchar(max)
)

set @_userId = (select ID from dbo.HRnextUser where Username = @_username);

;with ExcludedUserCompanies as
(
    select
        CompanyID
    from
        dbo.HRnextUserCompanyExclude
    where
        HRnextUserID = @_userId
),
CompanyList as
(
    select
        ID
    from
        dbo.Company
    where
        ID not in (select CompanyID from ExcludedUserCompanies)
)

insert into @employeeList
select
    ID,
    CompanyID,
    FirstName,
    LastName
from
    dbo.Employee
where
    CompanyID in (select ID from CompanyList)

-- Get total count for pagination
select
    count(*) as totalCount
from
    @employeeList

select
    ID,
    CompanyID,
    FirstName,
    LastName
from
    @employeeList
order by CompanyID
