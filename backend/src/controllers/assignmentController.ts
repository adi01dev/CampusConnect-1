import { Request, Response } from "express";
import Assignment from "../models/Assignment";

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
