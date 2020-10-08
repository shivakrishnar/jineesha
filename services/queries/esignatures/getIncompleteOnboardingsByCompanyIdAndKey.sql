select
    ID
from 
    dbo.EmployeeOnboard
where
    CompanyID = @companyId
    and OB_Key = @id
    and OnboardingStatusTypeID < 5 --onboarding status IDs run incrementally from 1 to 5, created to approved, we want things that are in statuses before approved