declare @_employeeId as int = @employeeId;
declare @_username as nvarchar(max) = '@username';

declare @_userId as int = (select ID from dbo.HRnextUser where Username = @_username);
declare @_companyId as int = (select CompanyID from dbo.Employee where ID = @_employeeId);

select
    ee.ID,
    ee.CompanyID,
    ee.EmployeeCode,
    ee.FirstName,
    ee.LastName
from
    dbo.Employee ee
where
    ee.ID = @_employeeId and
    ee.CompanyID = @_companyId and
    ee.CompanyID not in (
        select
            CompanyID
        from
            dbo.HRnextUserCompanyExclude
        where
            HRnextUserID = @_userId
    )
