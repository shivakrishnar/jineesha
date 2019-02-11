select 
    id = ID,
    amount = Amount,
    routingNumber = RoutingNumber,
    accountNumber = Account,
    amountType = case
                    when AmountCode = '%' then 'Percentage'
                    when AmountCode = 'Flat' then 'Flat'
                    else 'Balance Remainder'
                end,
    status = case 
                when ApprovalStatus is null then 'No Status'
                when ApprovalStatus = -1 then 'Rejected'
                when ApprovalStatus = 0 then 'Pending'
                when ApprovalStatus = 1 then 'Approved'
            end,
    designation = case 
                      when Checking = 1 then 'Checking'
                      when IsSavings = 1 then 'Savings'
                      when IsMoneyMarket = 1 then 'MoneyMarket'
                  end,
    edId = EvoFK_EmployeeEarningsDeduction
from 
    dbo.EmployeeDirectDeposit 
where 
    ID = @directDepositId