
-----------------------------------------------------------
---  Retrieves metadata for Direct Deposits
----------------------------------------------------------

;with DirectDepositMetadata 
as 
(
select
	FirstName = ee.FirstName,
	LastName =  ee.LastName,
	[Address] =  ee.Address1,
	City = ee.City,
	ee.Zip,
	Email = ee.EmailAddress,
    ee.PhoneHome,
	ee.PhoneCell,
	cp.CompanyName,
	DisplayName = ee.CurrentDisplayName,
	HireDate= ee.CurrentOriginalHireDate, 
	TermDate = ee.CurrentTerminationDate,
	DirectDepositStartDate = dd.StartDate,
	DirectDepositEndDate = dd.EndDate,
	DirectDepositAccount = dd.Account,
	DirectDepositAccountType = case 
									when Checking = 1 then 'Checking'
									when IsSavings = 1 then 'Savings'
									when IsMoneyMarket = 1 then 'MoneyMarket'
								end,
	DirectDepositRouting = dd.RoutingNumber,
	DirectDepositAmountCode = dd.AmountCode,
	DirectDepositAmount = dd.Amount,
	DirectDepositStatus = dd.ApprovalStatus,
	DirectDepositNameOnAccount = dd.NameOnAccount
	    
from 
	dbo.EmployeeDirectDeposit dd
	inner join dbo.Employee ee on dd.EmployeeID = ee.ID
	inner join dbo.Company cp on ee.CompanyID = cp.ID
where
	dd.ID = @directDepositId
)
select *
from 
	DirectDepositMetadata
	cross apply (
		select top 1   -- intentional safeguard against multiple accounts 
			MatchingURLs
		from 
			dbo.HRnextAccount 
		) baseUrls