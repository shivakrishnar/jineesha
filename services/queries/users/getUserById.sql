select
    ID,
    IsGA,
    IsSuperAdmin,
    FirstName,
    LastName
from
    dbo.HRnextUser
where
    Username = '@username'