# Smartling Bulk File Import

Bulk import for adding existing translations to files in Smartling projects.

This is a NodeJS project which runs locally by using Postman's [Newman](https://github.com/postmanlabs/newman) to loop through a list of files within a directory you specify and will upload them using the Smartling API as completed translations for an existing project you have in your Smartling account.

## How to Use

First clone the repository to your machine, then create a file in the projects root directory called `settings.json`, copy the example JSON object from `settings.example.json` and fill in the values with your own settings and authentication credentials.

settings.json should be in the format:

```
{
  "directory": "",
  "fileType": "",
  "targetLocale": "",
  "project": "",
  "fileUri": "",
  "translationState": "",
  "overwrite": "",
  "auth": {
    "userIdentifier": "",
    "userSecret": ""
  }
}
```

## Settings

**directory**

The path on your local file system pointing to the containing directory of the files that will be imported. This directory should only contain the files you want to upload for this particular import, which should be for one locale in a project.

**fileType**

The file type/extension you will be uploading, this value is parsed directly to the Smartling API so needs to be a value which is supports (android, ios, gettext, html, yaml, javaProperties, xliff, xml, json, docx, pptx, xlsx, idml, plaintext, qt, resx, cvs, srt, stringsdict).

**targetLocale**

The locale the file imports will be stored against. For example if your source locale is en-GB and you are uploading translation for fr-FR, the `targetLocale` value would be fr-FR.

**project**

The project id from Smartling which you are uploading to, this can be taken from the URL in the dashboard `https://dashboard.smartling.com/app/projects/<id>/dashboard/`.

**fileUri**

For every file uploaded this value is parsed to the Smartling API, but the file's name will be added on the end automatically, so the setting entered here should be just the containing directory where the file sits. In a connector project this might look like `master/i18n/en-GB`.

**translationState**

Should be either "PUBLISHED" or "POST_TRANSLATION".

**overwrite**

A boolean value signifying whether existing translations should be overwritten. It needs to be entered here as a string, either `"true"` or `"false"`.

**auth**

An object containing your Smartling API auth credentials, these can be obtained from your dashboard.

