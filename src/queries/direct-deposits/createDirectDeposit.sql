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
