import connectDB from "@/lib/db";
import NavbarSection from "@/models/NavbarSection";
import { NextResponse } from "next/server";

// GET: fetch all navbar sections with populated categories
export async function GET() {
  await connectDB();
  try {
    const sections = await NavbarSection.find().populate('links.category');
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: add new section
// Body: { section, sectionUrl, links: [...] }
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    if (!body.section) {
      return NextResponse.json({ success: false, message: "Section name is required" }, { status: 400 });
    }

    const newSection = new NavbarSection({
      section: body.section,
      sectionUrl: body.sectionUrl || '',
      links: (body.links || []).map(link => ({
        title: link.title,
        url: link.url,
        clickText: link.clickText || '',
        enabled: typeof link.enabled === "boolean" ? link.enabled : true,
        category: link.category || null
      }))
    });

    await newSection.save();
    return NextResponse.json({ success: true, data: newSection });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: update section title, sectionUrl, add/edit/delete link
// Body: { sectionId, newSectionName, newSectionUrl, addLink, updateLink, deleteLink }
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { sectionId, newSectionName, newSectionUrl, addLink, updateLink, deleteLink } = body;

    if (!sectionId) {
      return NextResponse.json({ success: false, message: "sectionId is required" }, { status: 400 });
    }

    const section = await NavbarSection.findById(sectionId);
    if (!section) {
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });
    }

    // Update section name
    if (newSectionName) section.section = newSectionName;

    // Update sectionUrl
    if (newSectionUrl !== undefined) section.sectionUrl = newSectionUrl;

    // Add new link
    if (addLink && addLink.title && addLink.url) {
      section.links.push({
        title: addLink.title,
        url: addLink.url,
        clickText: addLink.clickText || '',
        enabled: typeof addLink.enabled === "boolean" ? addLink.enabled : true,
        category: addLink.category || null
      });
    }

    // Update existing link by index
    if (updateLink && typeof updateLink.index === "number") {
      const idx = updateLink.index;
      if (section.links[idx]) {
        if (updateLink.title !== undefined) section.links[idx].title = updateLink.title;
        if (updateLink.url !== undefined) section.links[idx].url = updateLink.url;
        if (updateLink.clickText !== undefined) section.links[idx].clickText = updateLink.clickText;
        if (typeof updateLink.enabled === "boolean") section.links[idx].enabled = updateLink.enabled;
        if (updateLink.category !== undefined) section.links[idx].category = updateLink.category || null;
      } else {
        return NextResponse.json({ success: false, message: "Link index out of range" }, { status: 400 });
      }
    }

    // Delete link by index
    if (typeof deleteLink === "number") {
      if (section.links[deleteLink]) {
        section.links.splice(deleteLink, 1);
      } else {
        return NextResponse.json({ success: false, message: "Link index out of range" }, { status: 400 });
      }
    }

    await section.save();
    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: delete entire section
// Body: { sectionId }
export async function DELETE(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { sectionId } = body;

    if (!sectionId) {
      return NextResponse.json({ success: false, message: "sectionId is required" }, { status: 400 });
    }

    const deleted = await NavbarSection.findByIdAndDelete(sectionId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Section deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}