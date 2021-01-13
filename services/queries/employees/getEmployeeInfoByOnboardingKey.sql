select
    FirstName as firstName,
    LastName as lastName,
    EmailAddress as emailAddress,
    EmployeeCode as employeeCode
from
    dbo.EmployeeOnboard
where
    OB_Key = '@onboardingKey'