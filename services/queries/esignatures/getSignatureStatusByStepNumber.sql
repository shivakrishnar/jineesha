select
    ID,
    Name,
    Priority,
    StepNumber
from
    dbo.SignatureStatus
where
    StepNumber = @stepNumber