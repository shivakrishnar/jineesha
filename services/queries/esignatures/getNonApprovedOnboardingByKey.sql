select *
from dbo.EmployeeOnboard ob
where ob.OB_Key = '@onboardingKey' and OnboardingStatusTypeID < 5