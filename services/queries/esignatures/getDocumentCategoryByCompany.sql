declare @_CompanyId int = @companyId;
declare @tmp table ( Category nvarchar(50) )

insert into @tmp 
select Category
from dbo.EsignatureMetadata
where trim('    ' from Category) is not null and Category <> '' and CompanyID = @_CompanyID
union
select DocumentCategory as Category
from dbo.Document
where trim('    ' from DocumentCategory) is not null and DocumentCategory <> '' and CompanyID = @_CompanyID
union
select Category
from dbo.FileMetadata
where trim('    ' from Category) is not null and Category <> '' and CompanyID = @_CompanyID

select count(*) as totalCount
from @tmp

select Category
from @tmp
order by Category