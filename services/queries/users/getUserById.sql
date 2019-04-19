select
    ID,
    IsGA,
    IsSuperAdmin
from
    dbo.HRnextUser
where
    Username = '@username'