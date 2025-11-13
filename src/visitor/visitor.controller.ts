import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { CreateVisitorDto, UpdateVisitorDto } from './dto/visitor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitors')
export class VisitorController {
    constructor(private readonly visitorService: VisitorService) { }

    @Post()
    @Roles('perhutani')
    async create(@Body() createVisitorDto: CreateVisitorDto, @Req() req: any) {
        const userId = req.user.id;
        createVisitorDto.created_by = userId;
        return this.visitorService.createVisitor(createVisitorDto);
    }

    @Post('/list')
    @Roles('perhutani', 'admin')
    async findAll(@Body() query: PaginationDto, @Req() req: any) {
        const additionalWhere: Record<string, any> = {};
        if (req.user.role === 'admin') {
            additionalWhere.visitors_odtws = {
                some: {
                    odtw_id: {
                        equals: req.user.odtw_id
                    }
                }
            };
        }
        return this.visitorService.findAllVisitorsPaginated(query, additionalWhere);
    }

    @Get(':id')
    @Roles('perhutani', 'admin')
    async findOne(@Param('id') id: string) {
        return this.visitorService.findVisitorById(id);
    }

    @Patch(':id')
    @Roles('perhutani')
    async update(
        @Param('id') id: string,
        @Body() updateVisitorDto: UpdateVisitorDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        updateVisitorDto.updated_by = userId;
        return this.visitorService.updateVisitor(id, updateVisitorDto);
    }

    @Delete(':id')
    @Roles('perhutani')
    async remove(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.visitorService.softDeleteVisitor(id, userId);
    }
}