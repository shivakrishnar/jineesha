;with Manager(ID)
as 
(
  select
     ee.ID
  from 
    dbo.Employee ee
    inner join dbo.HRnextUserEmployee ue on ue.EmployeeID = ee.ID 
    inner join dbo.HRnextUser hru on hru.ID = ue.HRnextUserID
  where
      hru.Username = '@managerEmail'
)
select 
    ee.EmailAddress,
    ee.EmployeeCode
from
    dbo.Employee ee,
    Manager m
where 
    m.ID in (ee.CurrentSupervisor1ID, ee.CurrentSupervisor2ID, ee.CurrentSupervisor3ID)