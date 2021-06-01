select
    ID,
    Name
from
    dbo.BillingEventType
where
    Name = '@name'