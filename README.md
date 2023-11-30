# Flatirons Development Back-end Rails Developer Coding Test

Be sure to read **all** of this document carefully, and follow the guidelines within.

## Context

Use Ruby On Rails to implement a pipeline to upload and process the following CSV file containing a list of products. The file could contain many rows.

[CSV File](https://github.com/flatironsdevelopment/rails_test/raw/main/data.csv)


## Requirements

1. The products should be stored along with multiple exchange rates at the time of the upload utilizing this [API](https://github.com/fawazahmed0/currency-api) (include at least 5 currencies, we should be able to add more currencies later on). There should be validations on the presence of fields.
2. There should be a CRUD for products and exchange rates for those products after they’ve been uploaded.
3. There should be an index endpoint returning all the processed rows as well as all the available conversions that were stored at the time of the data intake.
4. There should be a way to filter and sort products
5. Include tests for all the key areas
6. Resourceful routing only

### Bonus

- Write concise and clear commit messages
- Describe improvement opportunities when you conclude

## Submission

> Where should I send back the result when I'm done?

Create a branch and send a Pull Request into main when you are done. 
There is no deadline for this task unless otherwise noted to you directly.
In the pull request, please include a video walk-through (roughly 2-3 minutes) of your code and the experience you built. [Vidyard](https://www.vidyard.com/chrome-extension-screen-recording/?utm_source=google-ads&utm_medium=cpc&utm_campaign=ChromeExtensionScreenRecord&utm_content=Extention_ChromeExt&utm_term=computer%20screen%20recorder%20free_b&gclid=Cj0KCQiA0eOPBhCGARIsAFIwTs4sn5e2WT7CGOsil0csKejSIthegolcNF2hVsixwJIOXI1zKWW8eO4aAgoVEALw_wcB) is a good choice.

## Questions

If you have any questions, just create a new issue in this repo and we will respond and get back to you quickly.
