declare @_amountType as nvarchar(40) = '@amountType';
declare @_status as nvarchar(40) = '@status'
declare @_designation as nvarchar(40) = '@designation';

insert into dbo.EmployeeDirectDeposit (
    EmployeeID,
    RoutingNumber,
    Account,
    StartDate,
    AmountCode,
    Amount,
    ApprovalStatus,
    Checking,
    IsSavings,
    IsMoneyMarket
)
output
    inserted.EmployeeID,
    inserted.RoutingNumber,
    inserted.Account,
    inserted.StartDate,
    inserted.AmountCode,
    inserted.Amount,
    inserted.ApprovalStatus,
    case
        when (inserted.Checking = 'true') then 1
        else 0
    end as Checking,
    case
        when (inserted.IsSavings = 'true') then 1
        else 0
    end as IsSavings,
    case
        when (inserted.IsMoneyMarket = 'true') then 1
        else 0
    end as IsMoneyMarket
values (
    @employeeId, 
    '@routingNumber',
    '@accountNumber',
    convert(date, getdate()),
    case
        when (@_amountType = 'Percentage') then '%'
        when (@_amountType = 'Flat') then 'Flat'
        else 'Balance Remainder'
    end,
    case
        when (@_amountType = 'Balance Remainder') then null
        else @amount
    end,
    case
        when (@_status = 'Rejected') then -1
        when (@_status = 'Approved') then 1
        else 0
    end,
    case
        when (@_designation = 'Checking') then 1
        else 0
    end,
    case
        when (@_designation = 'Savings') then 1
        else 0
    end,
    case
        when (@_designation = 'MoneyMarket') then 1
        else 0
    end
);

select scope_identity() as ID;
