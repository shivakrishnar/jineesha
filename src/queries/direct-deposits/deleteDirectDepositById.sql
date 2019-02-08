delete
from
    dbo.EmployeeDirectDeposit
output
    deleted.EmployeeID,
    deleted.RoutingNumber,
    deleted.Account,
    deleted.StartDate,
    deleted.AmountCode,
    deleted.Amount,
    deleted.ApprovalStatus,
    case
        when (deleted.Checking = 'true') then 1
        else 0
    end as Checking,
    case
        when (deleted.IsSavings = 'true') then 1
        else 0
    end as IsSavings,
    case
        when (deleted.IsMoneyMarket = 'true') then 1
        else 0
    end as IsMoneyMarket
where
    ID = @directDepositId