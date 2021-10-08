select
    e.ID
from
    dbo.Employee e
    inner join dbo.HRnextUserEmployee ue on e.ID = ue.EmployeeID
    inner join dbo.HRnextUser u on ue.HRnextUserID = u.ID
where
    u.Username = '@emailAddresses'