select FSDocument, Extension from openjson(
    (
        select top 1
          d.FSDocument, d.Extension
        from dbo.Company c
        left join dbo.Document d
          on c.Id = d.CompanyId and d.Title = 'Company Logo'
        where c.Id = @companyId
        order by d.UploadDate desc
        for json auto
    )
) with (FSDocument nvarchar(max), Extension nvarchar(max))
