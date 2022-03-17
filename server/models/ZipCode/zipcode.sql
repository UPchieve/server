/* @name getZipCodeByZipCode */
SELECT
    code AS zip_code,
    income AS median_income,
FROM
    postal_codes
WHERE
    code = :zipCode!;

