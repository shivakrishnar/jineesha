select
    eo.*,
    ots.IsOn
from dbo.EmployeeOnboard eo
join dbo.OnboardingTaskStep ots on ots.OnboardingTaskListID = eo.OnboardingTaskListID
join dbo.OnboardingTaskStepType otst on otst.ID = ots.OnboardingTaskStepTypeID
where
    eo.OB_Key = '@onboardingKey'
    and otst.Description = 'Company Document'