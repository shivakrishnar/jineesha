select
    eo.*
from dbo.EmployeeOnboard eo
join dbo.Employee ee on ee.EmployeeCode = eo.EmployeeCode and ee.CompanyID = eo.CompanyID
where
    eo.OB_Key = '@onboardingKey'
    and ee.ID = @employeeId
