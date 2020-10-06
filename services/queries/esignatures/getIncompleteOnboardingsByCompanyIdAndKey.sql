select
    ID
from 
    dbo.EmployeeOnboard
where
    CompanyID = @companyId
    and OB_Key = @id
    and OnboardingStatusTypeID < 5