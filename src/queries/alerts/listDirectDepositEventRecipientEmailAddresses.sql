
-----------------------------------------------------------
---  list supervisors email and optionally the employee email
----------------------------------------------------------


;with EmailAddressList 
as 
(
	select
	    EmployeeID = ee.ID, 
		EmailAddress = iif(@includeDirectDepositOwnerEmail = 1, ee.EmailAddress, null),
		FirstSupervisorEmailAddress = iif(@includeFirstMgr = 1,(select EmailAddress from dbo.Employee where ID = ee.CurrentSupervisor1ID), null) ,
		SecondSupervisorEmailAddress = iif(@includeSecondMgr = 1,(select EmailAddress from dbo.Employee where ID = ee.CurrentSupervisor2ID), null) ,
		ThirdSupervisorEmailAddress = iif(@includeThirdMgr = 1,(select EmailAddress from dbo.Employee where ID = ee.CurrentSupervisor3ID), null) 
	from 
		dbo.EmployeeDirectDeposit dd
		inner join dbo.Employee ee on dd.EmployeeID = ee.ID
	where
		dd.ID = @directDepositId
)
, 
SupervisorEmailAddressList 
as 
(
	select 
		EmployeeID, 
		Email
	from
	(
	  select
		EmployeeID,
		EmailAddress,
		FirstSupervisorEmailAddress,
		SecondSupervisorEmailAddress,
		ThirdSupervisorEmailAddress
	  from 
			EmailAddressList
	) as cp
	unpivot 
	(
	  Email for Emails in ([EmailAddress],[FirstSupervisorEmailAddress],[SecondSupervisorEmailAddress],[ThirdSupervisorEmailAddress])
	) as up
),
OtherEmailRecipients 
as
(
	select
		EmailAddress
	from 
		dbo.Employee
	where
		 ID in (@recipientEmployeeIds) --(23307, 24312)   

	union

	select
		EmailAddress = Username
	from 
		dbo.HRnextUser
	where
		ID in (@recipientUserIds) --( 1331,1349)   
)
select EmailAddress from OtherEmailRecipients 
union
select [EmailAddress] = Email from SupervisorEmailAddressList 
