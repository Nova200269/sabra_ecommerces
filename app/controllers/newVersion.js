
import express from "express";
import newVersion from "../models/newVersion.js";
import HttpError from "../utils/error/httpError.js";


//Add By Mohamad 

/*
@des get version
@route  /newversion
@method Get
@access public
*/
export const getNewVersion =
    async (req, res, next) => {
        try {
            const getNewVersion = await newVersion.findOne({
                idVersion: { $eq: 1 },
            });

            if (getNewVersion) {
                res.status(201).json({
                    status: "success",
                    data: getNewVersion,
                });
            } else {
                res.status(201).json({
                    status: "success",
                    data: {},
                });
            }
        } catch (error) {
            return next(error);

        }

    };



/*
@des post version
@route  /newversion/idVersion
@method post
@access praivate
*/

export const addNewVersion =
    async (req, res, next) => {
        let messageNull = [
            {
                "lang": "eng",
                "value": "A new update for Advanced is now available! Update now to enjoy the latest features and improvements."
            },
            {
                "lang": "ar",
                "value": "تحديث جديد متاح الآن لتطبيق أدفانس! قم بالتحديث الآن للاستمتاع بأحدث الميزات والتحسينات."
            }
        ];
        try {
            let getNewVersion = await newVersion.findOne({
                idVersion: { $eq: 1 },
            });
            if (getNewVersion) {
                let newVersionModel = await newVersion.findByIdAndUpdate(getNewVersion.id, {
                    $set: {
                        min: req.body.min,
                        max: req.body.max,
                        idVersion: 1,
                        message: req.body.message ? req.body.message : messageNull,
                    }
                }, { new: true })

                res.status(201).json({
                    status: "success",
                    data: newVersionModel,
                });
                console.log(newVersionModel);
            } else {
                let newVersionModel = newVersion(
                    {
                        min: req.body.min,
                        max: req.body.max,
                        idVersion: 1,
                        message: req.body.message,
                    }
                );
                const result = await newVersionModel.save();

                res.status(201).json({
                    status: "success",
                    data: result,
                });
                console.log(newVersionModel);
            }
        } catch (error) {
            console.log(error);

            return next(error);

        }

    };

